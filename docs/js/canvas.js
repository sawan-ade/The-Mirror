// ============================================================
// THE MIRROR — Galaxy Canvas Renderer
// Uses Canvas 2D API for a cinematic constellation effect
// ============================================================

class GalaxyCanvas {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.nodes = [];
    this.edges = [];
    this.clusters = [];
    this.graphData = null;

    // Viewport state
    this.offset = { x: 0, y: 0 };
    this.scale = 1;
    this.targetOffset = { x: 0, y: 0 };
    this.targetScale = 1;

    // Interaction
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    this.hoveredNode = null;
    this.selectedNode = null;

    // Animation
    this.animFrame = null;
    this.time = 0;

    // Callbacks
    this.onNodeClick = null;
    this.onNodeHover = null;

    // Particles
    this.particles = [];

    // Mode
    this.highlightMode = null; // 'abandoned' | 'hidden' | null
    this.highlightedNodes = new Set();
    this.highlightedEdges = new Set();

    // Enhancements: Painting atmosphere & Timeline evolution
    this.paintingMood = false;
    this.timelineFilterDate = null;
    this.themeMode = 'light'; // Default to bright luminous mode as requested

    this.resize();
    this.initParticles();
    this.initEvents();
    this.loop();
  }

  // ─────────────────────────────────────────────
  // Setup
  // ─────────────────────────────────────────────

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;
  }

  initParticles() {
    this.particles = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.4 + 0.05,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      if (this.graphData) this.layout(this.graphData);
    });

    // Drag
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.dragStartPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.targetOffset.x += dx;
        this.targetOffset.y += dy;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      } else {
        this.handleHover(e);
      }
    });

    window.addEventListener('mouseup', (e) => {
      const dx = Math.abs(e.clientX - (this.dragStartPos?.x || 0));
      const dy = Math.abs(e.clientY - (this.dragStartPos?.y || 0));
      if (dx < 5 && dy < 5) {
        this.handleClick(e);
      }
      this.isDragging = false;
    });

    // Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
      this.targetScale = Math.max(0.3, Math.min(3.5, this.targetScale * zoomFactor));
    }, { passive: false });
  }

  // ─────────────────────────────────────────────
  // Data ingestion & layout
  // ─────────────────────────────────────────────

  loadGraph(data) {
    this.graphData = data;
    this.clusters = data.clusters || [];
    this.layout(data);
  }

  layout(data) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const centerX = W / 2;
    const centerY = H / 2;

    // Group nodes by cluster
    const clusterMap = {};
    (data.clusters || []).forEach(c => { clusterMap[c.id] = []; });
    (data.nodes || []).forEach(n => {
      if (clusterMap[n.cluster]) clusterMap[n.cluster].push(n);
      else clusterMap[n.cluster] = [n];
    });

    const clusterIds = Object.keys(clusterMap);
    const numClusters = clusterIds.length;
    const minDim = Math.min(W, H);
    // Generous cluster radius for expansive spatial constellation
    const clusterRadius = minDim * 0.34;

    this.nodes = [];
    const clusterCenters = {};

    clusterIds.forEach((cid, ci) => {
      const angle = (ci / numClusters) * Math.PI * 2 - Math.PI / 2;
      const clusterCx = centerX + Math.cos(angle) * (clusterRadius * 1.15); // wider horizontal ellipse
      const clusterCy = centerY + Math.sin(angle) * (clusterRadius * 0.82);
      clusterCenters[cid] = { x: clusterCx, y: clusterCy };

      const members = clusterMap[cid];
      members.forEach((node, ni) => {
        const spread = minDim * 0.12 + (members.length * 8);
        const nodeAngle = (ni / members.length) * Math.PI * 2 + (ci * 0.5);
        const nodeR = spread * (0.45 + (ni % 3) * 0.25);
        const baseX = clusterCx + Math.cos(nodeAngle) * nodeR;
        const baseY = clusterCy + Math.sin(nodeAngle) * nodeR;

        this.nodes.push({
          ...node,
          x: baseX,
          y: baseY,
          clusterCenter: { x: clusterCx, y: clusterCy },
          radius: this.nodeRadius(node),
          color: this.clusterColor(node.cluster),
          pulsePhase: (ci * 1.5) + (ni * 0.8),
          vx: 0, vy: 0
        });
      });
    });

    // Build edge list with node references
    this.edges = (data.edges || []).map(e => ({
      ...e,
      sourceNode: this.nodes.find(n => n.id === e.source),
      targetNode: this.nodes.find(n => n.id === e.target)
    })).filter(e => e.sourceNode && e.targetNode);

    // ─── Force-Directed Relaxation to completely prevent node collisions ───
    for (let iter = 0; iter < 60; iter++) {
      // 1. Pairwise repulsion
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.hypot(dx, dy) || 1;
          const minDist = a.radius + b.radius + 42; // generous 42px clearance buffer
          if (dist < minDist) {
            const overlap = (minDist - dist) / dist * 0.5;
            a.x -= dx * overlap;
            a.y -= dy * overlap;
            b.x += dx * overlap;
            b.y += dy * overlap;
          }
        }
      }

      // 2. Cluster center gravity
      this.nodes.forEach(node => {
        if (node.clusterCenter) {
          const dx = node.clusterCenter.x - node.x;
          const dy = node.clusterCenter.y - node.y;
          node.x += dx * 0.045;
          node.y += dy * 0.045;
        }
      });

      // 3. Subtle edge spring
      this.edges.forEach(edge => {
        const a = edge.sourceNode;
        const b = edge.targetNode;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const idealDist = 120;
        if (dist > idealDist) {
          const force = (dist - idealDist) * 0.006 * (edge.strength || 0.5);
          a.x += (dx / dist) * force;
          a.y += (dy / dist) * force;
          b.x -= (dx / dist) * force;
          b.y -= (dy / dist) * force;
        }
      });
    }

    // Reset viewport with balanced initial framing
    this.targetOffset = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.targetScale = 0.92;
    this.scale = 0.85;
    this.layoutTime = this.time;
  }

  isNeighbor(a, b) {
    if (!a || !b || a.id === b.id) return false;
    return this.edges.some(e =>
      (e.source === a.id && e.target === b.id) ||
      (e.source === b.id && e.target === a.id)
    );
  }

  zoomIn() {
    this.targetScale = Math.min(3.5, this.targetScale * 1.25);
  }

  zoomOut() {
    this.targetScale = Math.max(0.35, this.targetScale * 0.8);
  }

  resetView() {
    this.targetOffset = { x: 0, y: 0 };
    this.targetScale = 0.92;
    this.clearHighlight();
  }

  focusCluster(clusterId) {
    const members = this.nodes.filter(n => n.cluster === clusterId);
    if (!members.length) return;
    const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
    const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.targetOffset.x = (W / 2 - cx) * 1.35;
    this.targetOffset.y = (H / 2 - cy) * 1.35;
    this.targetScale = 1.35;
    this.setHighlight('cluster', members.map(m => m.id), []);
  }

  nodeRadius(node) {
    const base = 6;
    const weight = node.weight || 0.5;
    const mentions = node.mentions || 1;
    return base + weight * 14 + Math.log(mentions + 1) * 3;
  }

  clusterColor(clusterId) {
    const colorMap = {
      career:     '#7C3AED', // Electric purple / violet
      technology: '#0284C7', // Sky cyan
      philosophy: '#059669', // Emerald mint
      creativity: '#E11D48', // Vivid coral rose
      health:     '#D97706', // Radiant golden honey
      default:    '#7C3AED'
    };
    return colorMap[clusterId] || colorMap.default;
  }

  clusterColorByKey(colorKey) {
    const map = {
      violet:  '#7C3AED', // Electric purple
      blue:    '#0284C7', // Vivid blue
      cyan:    '#0EA5E9', // Sky cyan
      rose:    '#E11D48', // Coral rose
      amber:   '#D97706', // Warm amber gold
      emerald: '#059669', // Emerald mint
      orange:  '#EA580C'  // Vibrant orange
    };
    return map[colorKey] || '#7C3AED';
  }

  setThemeMode(mode) {
    this.themeMode = mode || 'light';
  }

  setPaintingMood(enabled) {
    this.paintingMood = !!enabled;
  }

  setTimelineFilter(dateStr) {
    this.timelineFilterDate = dateStr;
  }

  isNodeBornByDate(node, targetDateStr) {
    if (!targetDateStr) return true;
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const parseToScore = (str) => {
      if (!str) return 0;
      const lower = str.toLowerCase();
      const yrMatch = lower.match(/\b(20\d\d)\b/);
      const yr = yrMatch ? parseInt(yrMatch[1], 10) : 2024;
      let mo = 1;
      for (let i = 0; i < months.length; i++) {
        if (lower.includes(months[i])) { mo = i + 1; break; }
      }
      return yr * 12 + mo;
    };

    const nodeScore = parseToScore(node.firstSeen || 'March 2024');
    const targetScore = parseToScore(targetDateStr);
    return nodeScore <= targetScore;
  }

  getSnapshotDataURL() {
    return this.canvas.toDataURL('image/png');
  }

  // ─────────────────────────────────────────────
  // Highlight modes
  // ─────────────────────────────────────────────

  setHighlight(mode, nodeIds, edgeIds) {
    this.highlightMode = mode;
    this.highlightedNodes = new Set(nodeIds || []);
    this.highlightedEdges = new Set(edgeIds || []);
  }

  clearHighlight() {
    this.highlightMode = null;
    this.highlightedNodes = new Set();
    this.highlightedEdges = new Set();
    this.selectedNode = null;
  }

  selectNode(nodeId) {
    this.selectedNode = this.nodes.find(n => n.id === nodeId) || null;
  }

  // ─────────────────────────────────────────────
  // Interaction
  // ─────────────────────────────────────────────

  worldToScreen(wx, wy) {
    return {
      x: (wx - this.canvas.width / 2) * this.scale + this.canvas.width / 2 + this.offset.x,
      y: (wy - this.canvas.height / 2) * this.scale + this.canvas.height / 2 + this.offset.y
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.canvas.width / 2 - this.offset.x) / this.scale + this.canvas.width / 2,
      y: (sy - this.canvas.height / 2 - this.offset.y) / this.scale + this.canvas.height / 2
    };
  }

  getNodeAtScreen(sx, sy) {
    const world = this.screenToWorld(sx, sy);
    let closest = null;
    let closestDist = Infinity;
    for (const node of this.nodes) {
      const dx = world.x - node.x;
      const dy = world.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = node.radius * 1.6;
      if (dist < hitRadius && dist < closestDist) {
        closest = node;
        closestDist = dist;
      }
    }
    return closest;
  }

  handleHover(e) {
    const node = this.getNodeAtScreen(e.clientX, e.clientY);
    const prev = this.hoveredNode;
    this.hoveredNode = node;
    if (this.onNodeHover && node !== prev) {
      this.onNodeHover(node, e.clientX, e.clientY);
    }
    this.canvas.style.cursor = node ? 'pointer' : 'grab';
  }

  handleClick(e) {
    const node = this.getNodeAtScreen(e.clientX, e.clientY);
    if (node && this.onNodeClick) {
      this.selectedNode = node;
      this.onNodeClick(node);
    }
  }

  focusNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.targetOffset.x = cx - node.x * this.scale;
    this.targetOffset.y = cy - node.y * this.scale;
    this.targetScale = 1.2;
    this.selectedNode = node;
  }

  // ─────────────────────────────────────────────
  // Render Loop
  // ─────────────────────────────────────────────

  loop() {
    this.animFrame = requestAnimationFrame(() => this.loop());
    this.time += 0.016;
    this.update();
    this.draw();
  }

  update() {
    // Smooth camera
    const lerp = 0.08;
    this.offset.x += (this.targetOffset.x - this.offset.x) * lerp;
    this.offset.y += (this.targetOffset.y - this.offset.y) * lerp;
    this.scale += (this.targetScale - this.scale) * lerp;

    // Update particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
    });

    // Node gentle drift
    this.nodes.forEach(node => {
      node.pulsePhase += 0.012;
      const drift = Math.sin(this.time * 0.3 + node.pulsePhase) * 0.3;
      node.y += drift * 0.05;
    });
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const isLight = this.themeMode === 'light';

    // Background
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.85);
    if (this.paintingMood) {
      if (isLight) {
        bg.addColorStop(0, '#FFFDF8');
        bg.addColorStop(0.45, '#FEF8EA');
        bg.addColorStop(0.85, '#F5EDD6');
        bg.addColorStop(1, '#EFE4C8');
      } else {
        bg.addColorStop(0, '#1c150c');
        bg.addColorStop(0.5, '#120d09');
        bg.addColorStop(1, '#070605');
      }
    } else {
      if (isLight) {
        bg.addColorStop(0, '#FCFBF8');
        bg.addColorStop(0.35, '#F6F3EB');
        bg.addColorStop(0.75, '#EDE7D9');
        bg.addColorStop(1, '#E2D9C5');
      } else {
        bg.addColorStop(0, '#0E1118');
        bg.addColorStop(0.4, '#090B10');
        bg.addColorStop(0.8, '#050608');
        bg.addColorStop(1, '#020304');
      }
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Particles (screen space, no transform)
    this.drawParticles();

    // World transform
    ctx.save();
    ctx.translate(W / 2 + this.offset.x, H / 2 + this.offset.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-W / 2, -H / 2);

    // Cluster halos & nebulas first
    this.drawClusterHalos();

    // Draw constellation edges
    this.drawEdges();

    // Nodes
    this.drawNodes();

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    const isLight = this.themeMode === 'light';
    this.particles.forEach(p => {
      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (isLight ? 1.3 : 1), 0, Math.PI * 2);
      if (this.paintingMood) {
        ctx.fillStyle = isLight
          ? `rgba(217, 119, 6, ${alpha * 0.65})`
          : `rgba(245, 166, 35, ${alpha * 0.85})`;
      } else {
        ctx.fillStyle = isLight
          ? `rgba(124, 58, 237, ${alpha * 0.5})`
          : `rgba(168, 255, 62, ${alpha * 0.7})`;
      }
      ctx.fill();

      // Subtle 4-point twinkle starlight for larger particles
      if (p.r > 2 && Math.sin(p.pulse) > 0.7) {
        ctx.beginPath();
        ctx.moveTo(p.x - p.r * 2.2, p.y);
        ctx.lineTo(p.x + p.r * 2.2, p.y);
        ctx.moveTo(p.x, p.y - p.r * 2.2);
        ctx.lineTo(p.x, p.y + p.r * 2.2);
        ctx.strokeStyle = isLight ? `rgba(124, 58, 237, ${alpha * 0.4})` : `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }
    });
  }

  drawClusterHalos() {
    if (!this.clusters.length || !this.nodes.length) return;
    const ctx = this.ctx;
    const isLight = this.themeMode === 'light';

    this.clusters.forEach(cluster => {
      const members = this.nodes.filter(n => n.cluster === cluster.id);
      if (!members.length) return;

      const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
      const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
      const maxDist = Math.max(...members.map(n => Math.hypot(n.x - cx, n.y - cy))) + 55;

      const color = this.clusterColorByKey(cluster.colorKey);
      const hx = color.replace('#', '');
      const r = parseInt(hx.substring(0, 2), 16);
      const g = parseInt(hx.substring(2, 4), 16);
      const b = parseInt(hx.substring(4, 6), 16);

      // Deep celestial diffuse aura
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDist * 1.25);
      const a1 = isLight ? 0.08 : 0.045;
      const a2 = isLight ? 0.03 : 0.015;
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a1})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a2})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(cx, cy, maxDist * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Delicate astronomical constellation boundary ring
      ctx.beginPath();
      ctx.arc(cx, cy, maxDist * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? `rgba(${r}, ${g}, ${b}, 0.07)` : `rgba(${r}, ${g}, ${b}, 0.05)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 16]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  drawEdges() {
    const ctx = this.ctx;
    const isLight = this.themeMode === 'light';

    this.edges.forEach(edge => {
      const src = edge.sourceNode;
      const tgt = edge.targetNode;
      if (!src || !tgt) return;

      const isHoverConnected = (this.hoveredNode && (edge.source === this.hoveredNode.id || edge.target === this.hoveredNode.id));
      const isSelectedConnected = (this.selectedNode && (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id));
      const isHighlighted = this.highlightedEdges.has(edge.id) ||
        (this.highlightedNodes.has(src.id) && this.highlightedNodes.has(tgt.id));

      const hasActiveFocus = !!(this.hoveredNode || this.selectedNode || this.highlightMode);

      let alpha;
      let lineWidth;

      if (isSelectedConnected || isHoverConnected || isHighlighted) {
        alpha = isLight ? 0.85 : 0.8;
        lineWidth = isLight ? 2 : 1.6;
      } else if (hasActiveFocus) {
        // When user is inspecting something, fade background edges to subtle whispering threads
        alpha = isLight ? 0.04 : 0.03;
        lineWidth = 0.6;
      } else {
        // Default calm constellation state
        alpha = (edge.strength || 0.5) * (isLight ? 0.16 : 0.12);
        lineWidth = isLight ? 0.9 : 0.75;
      }

      const color = this.clusterColor(src.cluster);
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Bezier curve calculations
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);
      const cpOffset = dist * 0.15;
      const perpX = -(tgt.y - src.y) / dist * cpOffset;
      const perpY =  (tgt.x - src.x) / dist * cpOffset;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(mx + perpX, my + perpY, tgt.x, tgt.y);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Traveling Synaptic Energy Photon (active edges)
      if (isSelectedConnected || isHoverConnected || isHighlighted) {
        const pulseT = ((this.time * 0.45 + (edge.strength || 0.5) * 1.5) % 1);
        const p1x = mx + perpX;
        const p1y = my + perpY;
        const omt = 1 - pulseT;
        const px = omt * omt * src.x + 2 * omt * pulseT * p1x + pulseT * pulseT * tgt.x;
        const py = omt * omt * src.y + 2 * omt * pulseT * p1y + pulseT * pulseT * tgt.y;

        ctx.beginPath();
        ctx.arc(px, py, isLight ? 2.8 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? `rgba(${r},${g},${b}, 0.95)` : '#FFFFFF';
        ctx.shadowColor = `rgba(${r},${g},${b}, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }

  drawNodes() {
    const ctx = this.ctx;
    const isLight = this.themeMode === 'light';

    this.nodes.forEach(node => {
      const isHovered = this.hoveredNode === node;
      const isSelected = this.selectedNode === node;
      const isHighlighted = this.highlightedNodes.has(node.id);
      
      // Determine if this node is connected to the hovered or selected node
      const isConnectedToFocus = (this.hoveredNode && this.isNeighbor(this.hoveredNode, node)) ||
                                 (this.selectedNode && this.isNeighbor(this.selectedNode, node));
      const hasActiveFocus = !!(this.hoveredNode || this.selectedNode || this.highlightMode);

      let isFaded = false;
      if (this.highlightMode) {
        isFaded = !isHighlighted && !isSelected;
      } else if (hasActiveFocus) {
        isFaded = !isHovered && !isSelected && !isConnectedToFocus;
      }

      const isBorn = this.isNodeBornByDate(node, this.timelineFilterDate);

      const pulse = Math.sin(this.time * 1.5 + node.pulsePhase) * 0.08 + 1;
      const r = node.radius * (isHovered ? 1.25 : isSelected ? 1.35 : 1) * pulse;
      const color = node.color;
      const hex = color.replace('#', '');
      const cr = parseInt(hex.substring(0, 2), 16);
      const cg = parseInt(hex.substring(2, 4), 16);
      const cb = parseInt(hex.substring(4, 6), 16);

      let alpha = isFaded ? (isLight ? 0.25 : 0.18) : 1;
      if (isHighlighted || isHovered || isSelected) alpha = 1;
      if (!isBorn) alpha *= 0.12;

      ctx.save();
      ctx.globalAlpha = alpha;

      // ─── 1. Soft Outer Atmospheric Halo ───
      if (isBorn) {
        const haloR = r * (isHovered || isSelected ? 3.4 : 2.5);
        const haloGrad = ctx.createRadialGradient(node.x, node.y, r * 0.4, node.x, node.y, haloR);
        const haloA = isSelected ? (isLight ? 0.4 : 0.3) : isHovered ? (isLight ? 0.32 : 0.24) : (isLight ? 0.16 : 0.1);
        haloGrad.addColorStop(0, `rgba(${cr},${cg},${cb},${haloA})`);
        haloGrad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${haloA * 0.45})`);
        haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();
      }

      // ─── 2. Celestial Frosted Glass Orb Body ───
      if (node.status === 'abandoned') {
        // Abandoned/Forgotten node: ethereal dashed ghost ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${isLight ? 0.6 : 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const ghostGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
        ghostGrad.addColorStop(0, `rgba(${cr},${cg},${cb},${isLight ? 0.25 : 0.15})`);
        ghostGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = ghostGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Modern celestial glass sphere
        const orbGrad = ctx.createRadialGradient(
          node.x - r * 0.25, node.y - r * 0.25, r * 0.1,
          node.x, node.y, r
        );
        if (isLight) {
          orbGrad.addColorStop(0, `rgba(255, 255, 255, 0.95)`); // soft luminous pearl catch
          orbGrad.addColorStop(0.2, `rgba(${cr},${cg},${cb}, 0.85)`);
          orbGrad.addColorStop(0.7, `rgba(${cr},${cg},${cb}, 0.95)`);
          orbGrad.addColorStop(1, `rgba(${Math.max(0, cr - 30)},${Math.max(0, cg - 30)},${Math.max(0, cb - 30)}, 0.95)`);
        } else {
          orbGrad.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
          orbGrad.addColorStop(0.25, `rgba(${cr},${cg},${cb}, 0.9)`);
          orbGrad.addColorStop(0.8, `rgba(${cr},${cg},${cb}, 0.6)`);
          orbGrad.addColorStop(1, `rgba(${cr},${cg},${cb}, 0.2)`);
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad;
        ctx.fill();

        // Delicate glass rim
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? `rgba(255,255,255,0.7)` : `rgba(${cr},${cg},${cb},0.85)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tiny inner starlight bead in the core
        ctx.beginPath();
        ctx.arc(node.x - r * 0.22, node.y - r * 0.22, Math.max(1, r * 0.16), 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      // ─── 3. Selected / Hovered Celestial Reticle & Orbital Photon ───
      if ((isSelected || isHovered) && isBorn) {
        const reticleR = r + 7;
        ctx.beginPath();
        ctx.arc(node.x, node.y, reticleR, 0, Math.PI * 2);
        ctx.strokeStyle = isLight ? `rgba(${cr},${cg},${cb}, 0.85)` : `rgba(255,255,255, 0.85)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 4 Compass Tick Marks
        const tickLen = 4;
        ctx.strokeStyle = isLight ? `rgba(${cr},${cg},${cb}, 0.9)` : '#FFFFFF';
        ctx.lineWidth = 1.5;
        // North
        ctx.beginPath(); ctx.moveTo(node.x, node.y - reticleR - tickLen); ctx.lineTo(node.x, node.y - reticleR + 1); ctx.stroke();
        // South
        ctx.beginPath(); ctx.moveTo(node.x, node.y + reticleR - 1); ctx.lineTo(node.x, node.y + reticleR + tickLen); ctx.stroke();
        // East
        ctx.beginPath(); ctx.moveTo(node.x + reticleR - 1, node.y); ctx.lineTo(node.x + reticleR + tickLen, node.y); ctx.stroke();
        // West
        ctx.beginPath(); ctx.moveTo(node.x - reticleR - tickLen, node.y); ctx.lineTo(node.x - reticleR + 1, node.y); ctx.stroke();

        // Orbiting photon bead
        const orbAngle = this.time * 2.8 + node.pulsePhase;
        const ox = node.x + Math.cos(orbAngle) * reticleR;
        const oy = node.y + Math.sin(orbAngle) * reticleR;
        ctx.beginPath();
        ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? `rgba(${cr},${cg},${cb}, 1)` : '#FFFFFF';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Emerging node: pulsing dashed aura
      if (node.status === 'emerging' && isBorn) {
        const ringR = r + 8 + Math.sin(this.time * 2.2 + node.pulsePhase) * 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb}, 0.45)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ─── 4. Photographic Memory Anchor Lens ───
      if (node.photos && node.photos.length > 0 && isBorn) {
        const badgeR = 7.5;
        const bx = node.x + r * 0.72;
        const by = node.y - r * 0.72;

        ctx.beginPath();
        ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#FFFFFF' : '#0F172A';
        ctx.fill();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb}, 0.9)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Crisp camera glyph
        ctx.fillStyle = `rgba(${cr},${cg},${cb}, 1)`;
        ctx.fillRect(bx - 3.5, by - 2, 7, 4.2);
        ctx.fillRect(bx - 1.2, by - 3.2, 2.4, 1.2);
        ctx.beginPath();
        ctx.arc(bx, by + 0.3, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#FFFFFF' : '#0F172A';
        ctx.fill();
      }

      // ─── 5. Intelligent Frosted Micro-Pill Typography ───
      const showLabel = isHovered || isSelected || isConnectedToFocus || (!isFaded && (node.weight >= 0.58 || node.mentions >= 15));
      if (showLabel && isBorn) {
        const labelText = node.label;
        const fontSize = isSelected ? 12 : isHovered ? 11.5 : 10.5;
        ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;

        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const pillW = textWidth + 16;
        const pillH = fontSize + 8;
        const pillX = node.x - pillW / 2;
        const pillY = node.y + r + 9;

        // Frosted micro-pill background
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }

        if (isLight) {
          ctx.fillStyle = isSelected
            ? 'rgba(255, 255, 255, 0.98)'
            : isHovered
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.88)';
          ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;

          ctx.strokeStyle = isSelected
            ? `rgba(${cr},${cg},${cb}, 0.8)`
            : isHovered
            ? `rgba(${cr},${cg},${cb}, 0.5)`
            : 'rgba(15, 23, 42, 0.12)';
          ctx.lineWidth = isSelected ? 1.5 : 1;
          ctx.stroke();

          ctx.fillStyle = isSelected ? `rgba(${cr},${cg},${cb}, 1)` : '#0F172A';
        } else {
          ctx.fillStyle = isSelected
            ? 'rgba(15, 23, 42, 0.96)'
            : isHovered
            ? 'rgba(15, 23, 42, 0.92)'
            : 'rgba(15, 23, 42, 0.82)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 2;
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;

          ctx.strokeStyle = isSelected
            ? `rgba(${cr},${cg},${cb}, 0.8)`
            : isHovered
            ? `rgba(${cr},${cg},${cb}, 0.5)`
            : 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = isSelected ? 1.5 : 1;
          ctx.stroke();

          ctx.fillStyle = isSelected ? '#FFFFFF' : '#F1F5F9';
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, node.x, pillY + pillH / 2);
      }

      ctx.restore();
    });
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
