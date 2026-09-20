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
    const clusterRadius = minDim * 0.28;

    // Position clusters in a ring, nodes within each cluster
    this.nodes = [];

    clusterIds.forEach((cid, ci) => {
      const angle = (ci / numClusters) * Math.PI * 2 - Math.PI / 2;
      const clusterCx = centerX + Math.cos(angle) * clusterRadius;
      const clusterCy = centerY + Math.sin(angle) * clusterRadius;

      const members = clusterMap[cid];
      members.forEach((node, ni) => {
        const spread = minDim * 0.1 + (members.length * 6);
        const nodeAngle = (ni / members.length) * Math.PI * 2;
        const nodeR = spread * (0.3 + Math.random() * 0.7);
        const baseX = clusterCx + Math.cos(nodeAngle) * nodeR;
        const baseY = clusterCy + Math.sin(nodeAngle) * nodeR;

        this.nodes.push({
          ...node,
          x: baseX,
          y: baseY,
          targetX: baseX,
          targetY: baseY,
          radius: this.nodeRadius(node),
          color: this.clusterColor(node.cluster),
          pulsePhase: Math.random() * Math.PI * 2,
          // Animation
          vx: 0, vy: 0,
          appearDelay: ci * 120 + ni * 40
        });
      });
    });

    // Build edge list with node references
    this.edges = (data.edges || []).map(e => ({
      ...e,
      sourceNode: this.nodes.find(n => n.id === e.source),
      targetNode: this.nodes.find(n => n.id === e.target)
    })).filter(e => e.sourceNode && e.targetNode);

    // Reset viewport
    this.targetOffset = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.targetScale = 1;
    this.scale = 0.6;
    this.layoutTime = this.time;
  }

  nodeRadius(node) {
    const base = 6;
    const weight = node.weight || 0.5;
    const mentions = node.mentions || 1;
    return base + weight * 14 + Math.log(mentions + 1) * 3;
  }

  clusterColor(clusterId) {
    const colorMap = {
      career:     '#9D7FEA',
      technology: '#60A5FA',
      philosophy: '#22D3EE',
      creativity: '#F472B6',
      health:     '#34D399',
      default:    '#A78BFA'
    };
    return colorMap[clusterId] || colorMap.default;
  }

  clusterColorByKey(colorKey) {
    const map = {
      violet:  '#9D7FEA',
      blue:    '#60A5FA',
      cyan:    '#22D3EE',
      rose:    '#F472B6',
      amber:   '#FBB040',
      emerald: '#34D399',
      orange:  '#FB923C'
    };
    return map[colorKey] || '#9D7FEA';
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

    // Background
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    bg.addColorStop(0, '#07071A');
    bg.addColorStop(0.5, '#040410');
    bg.addColorStop(1, '#030308');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Particles (screen space, no transform)
    this.drawParticles();

    // World transform
    ctx.save();
    ctx.translate(W / 2 + this.offset.x, H / 2 + this.offset.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-W / 2, -H / 2);

    // Draw edges first
    this.drawEdges();

    // Cluster halos
    this.drawClusterHalos();

    // Nodes
    this.drawNodes();

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    this.particles.forEach(p => {
      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
      ctx.fill();
    });
  }

  drawClusterHalos() {
    if (!this.clusters.length || !this.nodes.length) return;
    const ctx = this.ctx;

    this.clusters.forEach(cluster => {
      const members = this.nodes.filter(n => n.cluster === cluster.id);
      if (!members.length) return;

      const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
      const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
      const maxDist = Math.max(...members.map(n => Math.hypot(n.x - cx, n.y - cy))) + 40;

      const color = this.clusterColorByKey(cluster.colorKey);
      const hx = color.replace('#', '');
      const r = parseInt(hx.substring(0, 2), 16);
      const g = parseInt(hx.substring(2, 4), 16);
      const b = parseInt(hx.substring(4, 6), 16);

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDist);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.04)`);
      grad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.02)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(cx, cy, maxDist, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  }

  drawEdges() {
    const ctx = this.ctx;

    this.edges.forEach(edge => {
      const src = edge.sourceNode;
      const tgt = edge.targetNode;
      if (!src || !tgt) return;

      const isHighlighted = this.highlightedEdges.has(edge.id) ||
        (this.highlightedNodes.has(src.id) && this.highlightedNodes.has(tgt.id));
      const isFaded = this.highlightMode && !isHighlighted;
      const isSelected = this.selectedNode &&
        (edge.source === this.selectedNode.id || edge.target === this.selectedNode.id);

      let alpha = edge.strength * 0.25;
      if (isFaded) alpha = 0.04;
      if (isSelected) alpha = edge.strength * 0.65;
      if (isHighlighted) alpha = 0.8;

      const color = this.clusterColor(src.cluster);
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Bezier control point
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);
      const cpOffset = dist * 0.2;
      const perpX = -(tgt.y - src.y) / dist * cpOffset;
      const perpY =  (tgt.x - src.x) / dist * cpOffset;

      // Animated dash flow for selected edges
      if (isSelected) {
        ctx.save();
        ctx.setLineDash([6, 8]);
        ctx.lineDashOffset = -this.time * 15;
      }

      const grad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 1.5})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},${alpha})`);

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(mx + perpX, my + perpY, tgt.x, tgt.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = isSelected || isHighlighted ? 1.5 : 0.8;
      ctx.stroke();

      if (isSelected) {
        ctx.restore();
        // Glow
        ctx.save();
        ctx.filter = `blur(3px)`;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(mx + perpX, my + perpY, tgt.x, tgt.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  drawNodes() {
    const ctx = this.ctx;

    this.nodes.forEach(node => {
      const isHovered = this.hoveredNode === node;
      const isSelected = this.selectedNode === node;
      const isHighlighted = this.highlightedNodes.has(node.id);
      const isFaded = this.highlightMode && !isHighlighted && !isSelected;

      const pulse = Math.sin(this.time * 1.2 + node.pulsePhase) * 0.12 + 1;
      const r = node.radius * (isHovered ? 1.25 : isSelected ? 1.35 : 1) * pulse;
      const color = node.color;
      const hex = color.replace('#', '');
      const cr = parseInt(hex.substring(0, 2), 16);
      const cg = parseInt(hex.substring(2, 4), 16);
      const cb = parseInt(hex.substring(4, 6), 16);

      let alpha = isFaded ? 0.15 : 1;
      if (isHighlighted) alpha = 1;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer glow
      if (!isFaded) {
        const glowR = r * 2.5;
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
        const glowAlpha = isSelected ? 0.35 : isHovered ? 0.25 : 0.12;
        glow.addColorStop(0, `rgba(${cr},${cg},${cb},${glowAlpha})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Abandoned node: dimmer, desaturated ring
      if (node.status === 'abandoned') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.3)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        const innerGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
        innerGrad.addColorStop(0, `rgba(${cr},${cg},${cb},0.25)`);
        innerGrad.addColorStop(1, `rgba(${cr},${cg},${cb},0.05)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();
      } else {
        // Normal node
        const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.95)`);
        grad.addColorStop(0.6, `rgba(${cr},${cg},${cb},0.6)`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0.1)`);
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Border ring for selected
        if (isSelected || isHighlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.5)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Emerging node: outer pulse ring
      if (node.status === 'emerging') {
        const ringR = r + 6 + Math.sin(this.time * 2 + node.pulsePhase) * 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Node label
      const labelAlpha = isHovered || isSelected ? 1 : (isFaded ? 0 : (node.weight > 0.6 ? 0.7 : 0.3));
      if (labelAlpha > 0.1) {
        ctx.globalAlpha = alpha * labelAlpha;
        ctx.font = `${isSelected ? 500 : 400} ${Math.max(10, Math.min(14, node.radius * 0.9))}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = '#E8E8F0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, node.x, node.y + r + 5);
      }

      ctx.restore();
    });
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
