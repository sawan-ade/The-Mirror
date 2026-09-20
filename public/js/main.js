// ============================================================
// THE MIRROR — Main App Orchestrator v2
// HackerRank Orchestrate Aesthetics + Memories + Painting + Timeline + Share Card
// ============================================================

class MirrorApp {
  constructor() {
    this.graphData = null;
    this.usingDemo = false;

    // Modules
    this.galaxy = null;
    this.inspector = null;
    this.askPanel = null;

    // Timeline state
    this.timelineInterval = null;
    this.timelineMilestones = [
      "March 2024",
      "May 2024",
      "July 2024",
      "October 2024",
      "January 2025",
      "April 2025",
      "September 2025",
      "All Time"
    ];
    this.currentTimelineIndex = 7; // All Time

    // DOM refs
    this.processingOverlay = document.getElementById('processing-overlay');
    this.processingTextEl = document.getElementById('processing-text-main');
    this.processingSubEl = document.getElementById('processing-sub');
    this.inputModal = document.getElementById('input-modal');
    this.modeIndicator = document.getElementById('mode-indicator');
    this.modeLabel = document.getElementById('mode-label');
    this.tooltip = document.getElementById('node-tooltip');
    this.timelinePanel = document.getElementById('timeline-panel');
    this.paintingOverlay = document.getElementById('painting-canvas-overlay');

    this.init();
  }

  init() {
    // 1. Initialize canvas
    const canvasEl = document.getElementById('mirror-canvas');
    this.galaxy = new GalaxyCanvas(canvasEl);

    // 2. Initialize inspector
    this.inspector = new Inspector(
      this.galaxy,
      () => this.graphData
    );

    // 3. Initialize ask panel
    this.askPanel = new AskPanel(() => this.graphData);

    // 4. Wire inspector callbacks
    this.inspector.onWhyConnected = async (nodeA, nodeB, btn) => {
      btn.disabled = true;
      btn.textContent = 'Asking the Mirror…';
      try {
        const result = await AI.explain(nodeA, nodeB, this.graphData);
        this.inspector.showWhyResult(result, btn);
      } catch (err) {
        btn.textContent = 'Could not explain this connection.';
        btn.disabled = false;
      }
    };

    this.inspector.onOpenLightbox = (photo, node) => {
      this.openLightbox(photo, node);
    };

    this.inspector.onPhotoAdded = () => {
      this.updateStats();
    };

    // 5. Wire ask panel highlight
    this.askPanel.onHighlightNodes = (nodeIds) => {
      if (nodeIds.length) {
        this.galaxy.setHighlight('question', nodeIds, []);
      } else {
        this.galaxy.clearHighlight();
      }
    };

    // 6. Wire canvas interactions
    this.galaxy.onNodeClick = (node) => {
      this.inspector.open(node);
      if (this.askPanel) this.askPanel.close();
    };

    this.galaxy.onNodeHover = (node, x, y) => {
      this.updateTooltip(node, x, y);
    };

    // 7. Load dataset
    this.loadDemoData();

    // 8. Build UI components
    this.buildLegend();
    this.buildTimeline();
    this.bindNavEvents();
    this.updateStats();
  }

  // ─────────────────────────────────────────────
  // Data Loading
  // ─────────────────────────────────────────────

  loadDemoData() {
    this.graphData = window.DEMO_DATA;
    this.usingDemo = true;
    this.syncLocalStorageMemories();
    this.galaxy.loadGraph(this.graphData);
    this.buildLegend();
    this.buildTimeline();
    this.updateStats();
    this.showInsightToasts();
  }

  syncLocalStorageMemories() {
    if (!this.graphData?.nodes) return;
    this.graphData.nodes.forEach(node => {
      try {
        const saved = localStorage.getItem(`mirror_memories_${node.id}`);
        if (saved) {
          const extra = JSON.parse(saved);
          if (Array.isArray(extra)) {
            if (!node.photos) node.photos = [];
            extra.forEach(p => {
              if (!node.photos.find(existing => existing.id === p.id)) {
                node.photos.push(p);
              }
            });
          }
        }
      } catch (e) {
        console.warn('Sync memory error', e);
      }
    });
  }

  async extractFromText(text) {
    this.showProcessing('Extracting concepts…', 'Analyzing your intellectual landscape with Claude');
    try {
      const data = await AI.extract(text);
      this.graphData = data;
      this.usingDemo = false;
      this.syncLocalStorageMemories();
      this.galaxy.loadGraph(data);
      this.buildLegend();
      this.buildTimeline();
      this.updateStats();
      this.hideProcessing();
      this.closeInputModal();
      setTimeout(() => this.showInsightToasts(), 1500);
    } catch (err) {
      this.hideProcessing();
      alert(`Mirror could not process your thoughts: ${err.message}`);
    }
  }

  // ─────────────────────────────────────────────
  // UI Helpers
  // ─────────────────────────────────────────────

  showProcessing(text, sub = '') {
    if (this.processingTextEl) this.processingTextEl.textContent = text;
    if (this.processingSubEl) this.processingSubEl.textContent = sub;
    this.processingOverlay.classList.add('active');
    this.processingOverlay.classList.add('processing-overlay--active');
  }

  hideProcessing() {
    this.processingOverlay.classList.remove('active');
    this.processingOverlay.classList.remove('processing-overlay--active');
  }

  updateTooltip(node, x, y) {
    if (!node) {
      this.tooltip.classList.remove('visible');
      return;
    }
    const labelEl = this.tooltip.querySelector('.node-tooltip__label');
    const metaEl = this.tooltip.querySelector('.node-tooltip__meta');
    const thumbWrap = document.getElementById('node-tooltip-thumb');
    const thumbImg = document.getElementById('node-tooltip-thumb-img');

    if (labelEl) labelEl.textContent = node.label;
    if (metaEl) {
      const photoText = (node.photos && node.photos.length) ? ` · 📸 ${node.photos.length} memory` : '';
      metaEl.textContent = `${node.mentions || 1} mentions · ${node.status || 'Active'}${photoText}`;
    }

    if (node.photos && node.photos.length > 0 && thumbWrap && thumbImg) {
      thumbImg.src = node.photos[0].url;
      thumbWrap.style.display = 'block';
    } else if (thumbWrap) {
      thumbWrap.style.display = 'none';
    }

    const pad = 16;
    const tooltipW = 200;
    const posX = (x + tooltipW + pad > window.innerWidth) ? (x - tooltipW - pad) : (x + pad);
    const posY = Math.max(10, Math.min(window.innerHeight - 80, y - 20));

    this.tooltip.style.left = `${posX}px`;
    this.tooltip.style.top = `${posY}px`;
    this.tooltip.classList.add('visible');
  }

  buildLegend() {
    if (!this.graphData?.clusters) return;
    const legend = document.getElementById('cluster-legend');
    if (!legend) return;
    legend.innerHTML = '';

    this.graphData.clusters.forEach(c => {
      const color = this.clusterColorByKey(c.colorKey);
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-dot" style="background:${color}; box-shadow:0 0 8px ${color}60;"></div>
        <span>${c.label}</span>
      `;
      item.addEventListener('click', () => {
        const nodeIds = (this.graphData.nodes || [])
          .filter(n => n.cluster === c.id)
          .map(n => n.id);
        this.galaxy.setHighlight('cluster', nodeIds, []);
        this.setMode(`${c.label} cluster`);
      });
      legend.appendChild(item);
    });
  }

  updateStats() {
    if (!this.graphData) return;
    const nodes = this.graphData.nodes?.length || 0;
    const edges = this.graphData.edges?.length || 0;
    const clusters = this.graphData.clusters?.length || 0;
    
    // Count total visual memories
    let memoriesCount = 0;
    (this.graphData.nodes || []).forEach(n => {
      if (n.photos && n.photos.length) memoriesCount += n.photos.length;
    });

    const statNodes = document.getElementById('stat-nodes');
    const statMemories = document.getElementById('stat-memories');
    const statEdges = document.getElementById('stat-edges');
    const statClusters = document.getElementById('stat-clusters');

    if (statNodes) statNodes.textContent = nodes;
    if (statMemories) statMemories.textContent = memoriesCount;
    if (statEdges) statEdges.textContent = edges;
    if (statClusters) statClusters.textContent = clusters;
  }

  // ─────────────────────────────────────────────
  // Timeline Scrubber Feature
  // ─────────────────────────────────────────────

  buildTimeline() {
    const container = document.getElementById('timeline-entries');
    if (!container) return;
    container.innerHTML = '';

    this.timelineMilestones.forEach((dateStr, idx) => {
      const entry = document.createElement('div');
      entry.className = `timeline-entry ${idx === this.currentTimelineIndex ? 'active' : ''}`;
      entry.dataset.index = idx;

      // Count active nodes at this milestone
      const activeCount = dateStr === "All Time"
        ? (this.graphData.nodes?.length || 0)
        : (this.graphData.nodes || []).filter(n => this.galaxy.isNodeBornByDate(n, dateStr)).length;

      entry.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-date">${dateStr}</div>
        <div class="timeline-concept">${activeCount} thoughts</div>
      `;

      entry.addEventListener('click', () => {
        this.selectTimelineMilestone(idx);
      });

      container.appendChild(entry);
    });
  }

  selectTimelineMilestone(index) {
    this.currentTimelineIndex = index;
    const dateStr = this.timelineMilestones[index];
    const filter = (dateStr === "All Time") ? null : dateStr;

    // Apply to galaxy canvas
    this.galaxy.setTimelineFilter(filter);

    // Update active UI classes
    document.querySelectorAll('.timeline-entry').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    const labelEl = document.getElementById('timeline-current-date');
    const countEl = document.getElementById('timeline-active-count');
    if (labelEl) labelEl.textContent = dateStr;

    const activeCount = filter
      ? (this.graphData.nodes || []).filter(n => this.galaxy.isNodeBornByDate(n, filter)).length
      : (this.graphData.nodes?.length || 0);

    if (countEl) countEl.textContent = `${activeCount} active concepts`;

    if (filter) {
      this.setMode(`📅 Timeline: ${dateStr}`);
    } else {
      this.clearMode();
    }
  }

  toggleTimelinePlay() {
    const btn = document.getElementById('btn-timeline-play');
    if (this.timelineInterval) {
      clearInterval(this.timelineInterval);
      this.timelineInterval = null;
      if (btn) btn.textContent = '▶ Play Evolution';
    } else {
      if (btn) btn.textContent = '⏸ Pause';
      if (this.currentTimelineIndex >= this.timelineMilestones.length - 1) {
        this.selectTimelineMilestone(0);
      }
      this.timelineInterval = setInterval(() => {
        let next = this.currentTimelineIndex + 1;
        if (next >= this.timelineMilestones.length) {
          next = 0;
        }
        this.selectTimelineMilestone(next);
      }, 1800);
    }
  }

  // ─────────────────────────────────────────────
  // Visual Memories Gallery Feature
  // ─────────────────────────────────────────────

  openMemoriesGallery() {
    const overlay = document.getElementById('memories-gallery-overlay');
    const grid = document.getElementById('memories-gallery-grid');
    if (!overlay || !grid) return;

    grid.innerHTML = '';
    const allMemories = [];

    (this.graphData.nodes || []).forEach(node => {
      if (node.photos && node.photos.length > 0) {
        const cluster = (this.graphData.clusters || []).find(c => c.id === node.cluster);
        node.photos.forEach(photo => {
          allMemories.push({ photo, node, cluster });
        });
      }
    });

    if (allMemories.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-muted);">
          <p style="font-size:15px; margin-bottom:8px;">No visual memories attached yet.</p>
          <p style="font-size:12px;">Click any concept node to attach personal photo memories.</p>
        </div>
      `;
    } else {
      allMemories.forEach(item => {
        const { photo, node, cluster } = item;
        const clusterColor = this.clusterColorByKey(cluster?.colorKey);
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
          <div class="memory-card__img-wrap">
            <img src="${photo.url}" alt="${node.label}" />
          </div>
          <div class="memory-card__content">
            <div class="memory-card__node-title">${node.label}</div>
            <div class="memory-card__caption">"${photo.caption || ''}"</div>
            <div class="memory-card__footer">
              <span class="memory-card__date">${photo.date || ''}</span>
              <span class="memory-card__cluster" style="background:${clusterColor}20; color:${clusterColor}; border:1px solid ${clusterColor}40;">
                ${cluster?.label || node.cluster}
              </span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          overlay.classList.remove('modal-overlay--open');
          this.galaxy.focusNode(node.id);
          this.inspector.open(node);
        });

        grid.appendChild(card);
      });
    }

    overlay.classList.add('modal-overlay--open');
  }

  // ─────────────────────────────────────────────
  // Lightbox Modal
  // ─────────────────────────────────────────────

  openLightbox(photo, node) {
    const overlay = document.getElementById('lightbox-overlay');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    const tag = document.getElementById('lightbox-node-tag');

    if (!overlay || !img) return;

    img.src = photo.url;
    if (cap) cap.textContent = `"${photo.caption || ''}"`;
    if (tag) tag.textContent = `◈ ${node.label} · ${photo.date || ''}`;

    overlay.classList.add('modal-overlay--open');
  }

  // ─────────────────────────────────────────────
  // Share Card Poster Feature
  // ─────────────────────────────────────────────

  openShareModal() {
    const overlay = document.getElementById('share-modal-overlay');
    if (!overlay) return;

    const dominantTheme = this.graphData?.insights?.dominantTheme || 'Building in Public & Deep Systems';
    const observation = this.graphData?.insights?.mirrorObservation || 
      'A mind balancing deep architectural focus with the emerging courage to build in public.';
    const nodesCount = this.graphData?.nodes?.length || 0;
    const clustersCount = this.graphData?.clusters?.length || 0;
    const memoriesCount = (this.graphData?.nodes || []).reduce((acc, n) => acc + (n.photos?.length || 0), 0);

    const themeEl = document.getElementById('share-user-theme');
    const metaEl = document.getElementById('share-meta-text');
    const obsEl = document.getElementById('share-observation');

    if (themeEl) themeEl.textContent = `"${dominantTheme}"`;
    if (metaEl) metaEl.textContent = `${nodesCount} Concepts · ${clustersCount} Clusters · ${memoriesCount} Memories`;
    if (obsEl) obsEl.textContent = `"${observation}"`;

    overlay.classList.add('modal-overlay--open');
  }

  downloadShareCard() {
    const canvas = document.getElementById('share-export-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background deep dark
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    // Decorative top painting banner
    const paintingImg = new Image();
    paintingImg.crossOrigin = 'anonymous';
    paintingImg.onload = () => {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.drawImage(paintingImg, 0, 0, W, 260);
      ctx.restore();

      // Gradient fade over painting
      const fadeGrad = ctx.createLinearGradient(0, 0, 0, 320);
      fadeGrad.addColorStop(0, 'rgba(10,10,10,0.2)');
      fadeGrad.addColorStop(0.7, 'rgba(10,10,10,0.85)');
      fadeGrad.addColorStop(1, '#0A0A0A');
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, 0, W, 320);

      // Border outline
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      // Logo & Brand
      ctx.fillStyle = '#A8FF3E';
      ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('THE MIRROR  ·  ORCHESTRATE', 60, 80);

      // Dominant Theme
      const dominantTheme = this.graphData?.insights?.dominantTheme || 'Building in Public & Systems';
      ctx.fillStyle = '#F7F4EE';
      ctx.font = 'italic 700 46px "Playfair Display", serif';
      ctx.fillText(`"${dominantTheme}"`, 60, 200);

      // Observation
      const observation = this.graphData?.insights?.mirrorObservation || 
        'A mind balancing deep architectural focus with the emerging courage to build in public.';
      ctx.fillStyle = 'rgba(247,244,238,0.7)';
      ctx.font = 'italic 20px "Instrument Serif", Georgia, serif';
      ctx.fillText(`"${observation}"`, 60, 260);

      // Stats Pill Grid
      const nodesCount = this.graphData?.nodes?.length || 0;
      const clustersCount = this.graphData?.clusters?.length || 0;
      const memoriesCount = (this.graphData?.nodes || []).reduce((acc, n) => acc + (n.photos?.length || 0), 0);

      const stats = [
        { label: 'CONCEPTS', val: `${nodesCount}` },
        { label: 'CLUSTERS', val: `${clustersCount}` },
        { label: 'MEMORIES', val: `${memoriesCount}` },
        { label: 'DATE RANGE', val: '2024 – 2026' }
      ];

      stats.forEach((st, idx) => {
        const bx = 60 + idx * 260;
        const by = 380;
        ctx.fillStyle = '#161616';
        ctx.fillRect(bx, by, 220, 90);
        ctx.strokeStyle = 'rgba(247,244,238,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, 220, 90);

        ctx.fillStyle = '#A8FF3E';
        ctx.font = '700 32px "Space Mono", monospace';
        ctx.fillText(st.val, bx + 24, by + 48);

        ctx.fillStyle = 'rgba(247,244,238,0.5)';
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(st.label, bx + 24, by + 74);
      });

      // Footer
      ctx.fillStyle = 'rgba(247,244,238,0.4)';
      ctx.font = '13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Generated by The Mirror · Powered by Claude Sonnet', 60, 560);

      // Trigger download
      const link = document.createElement('a');
      link.download = 'The-Mirror-Thought-Universe.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    paintingImg.src = 'img/cosmic-oil-canvas.jpg';
  }

  // ─────────────────────────────────────────────
  // Insight Toasts & Hidden Connections
  // ─────────────────────────────────────────────

  showInsightToasts() {
    if (!this.graphData?.insights?.hiddenConnections?.length) return;
    const container = document.getElementById('insight-toast-container');
    if (!container) return;
    container.innerHTML = '';

    const hidden = this.graphData.insights.hiddenConnections[0];
    if (hidden) {
      const nodeA = this.graphData.nodes?.find(n => n.id === hidden.nodeA);
      const nodeB = this.graphData.nodes?.find(n => n.id === hidden.nodeB);
      if (nodeA && nodeB) {
        const toast = document.createElement('div');
        toast.className = 'insight-toast';
        toast.innerHTML = `
          <span>◈</span>
          Hidden connection discovered: <strong>${nodeA.label}</strong> ↔ <strong>${nodeB.label}</strong>
        `;
        toast.addEventListener('click', () => {
          this.revealHiddenConnection(hidden);
          container.innerHTML = '';
        });
        container.appendChild(toast);
        setTimeout(() => { if (container) container.innerHTML = ''; }, 9000);
      }
    }
  }

  revealHiddenConnection(connection) {
    const nodeIds = [connection.nodeA, connection.nodeB];
    this.galaxy.setHighlight('hidden', nodeIds, []);
    this.setMode('◈ Hidden Connection');

    const nodeA = this.graphData.nodes?.find(n => n.id === connection.nodeA);
    const nodeB = this.graphData.nodes?.find(n => n.id === connection.nodeB);

    if (nodeA && nodeB) {
      this.showHiddenConnectionModal(nodeA, nodeB, connection);
    }
  }

  showHiddenConnectionModal(nodeA, nodeB, connection) {
    const overlay = document.getElementById('hidden-modal-overlay');
    const content = document.getElementById('hidden-modal-content');

    content.innerHTML = `
      <div class="modal-header">
        <div>
          <div class="modal-title">◈ Hidden Connection Discovered</div>
          <div class="modal-subtitle">A non-obvious bridge discovered between disparate thoughts</div>
        </div>
        <button class="panel-close-btn" onclick="document.getElementById('hidden-modal-overlay').classList.remove('modal-overlay--open')">✕</button>
      </div>
      <div class="modal-body">
        <div class="hidden-connection-visual">
          <div class="hidden-node-pill" style="border-color:var(--green);">${nodeA.label}</div>
          <div class="hidden-connector">
            <div class="hidden-connector-line"></div>
            <div class="hidden-connector-label">${Math.round((connection.strength || 0.8) * 100)}% MATCH</div>
          </div>
          <div class="hidden-node-pill" style="border-color:var(--green);">${nodeB.label}</div>
        </div>

        <div class="explanation-box">
          "${connection.hypothesis}"
        </div>

        <div class="section-heading">Direct Journal Evidence</div>
        <div class="excerpt-list">
          <div class="excerpt-item">${connection.evidence}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn--primary" onclick="document.getElementById('hidden-modal-overlay').classList.remove('modal-overlay--open')">
          Explore on Map
        </button>
      </div>
    `;

    overlay.classList.add('modal-overlay--open');
  }

  setMode(label) {
    if (this.modeLabel) this.modeLabel.textContent = label;
    if (this.modeIndicator) this.modeIndicator.classList.add('visible');
  }

  clearMode() {
    if (this.modeIndicator) this.modeIndicator.classList.remove('visible');
    this.galaxy.clearHighlight();
    this.galaxy.setTimelineFilter(null);
  }

  openInputModal() {
    if (this.inputModal) {
      this.inputModal.classList.add('modal-overlay--open');
      const input = document.getElementById('user-text-input');
      if (input) input.focus();
    }
  }

  closeInputModal() {
    if (this.inputModal) this.inputModal.classList.remove('modal-overlay--open');
  }

  clusterColorByKey(colorKey) {
    const map = {
      violet:  '#A8FF3E',
      blue:    '#64D8CB',
      cyan:    '#22D3EE',
      rose:    '#FF6B6B',
      amber:   '#F5A623',
      emerald: '#A8FF3E',
      orange:  '#FF9A3C'
    };
    return map[colorKey] || '#A8FF3E';
  }

  // ─────────────────────────────────────────────
  // Event Bindings
  // ─────────────────────────────────────────────

  bindNavEvents() {
    // 📸 Memories gallery
    const btnMemories = document.getElementById('btn-memories');
    if (btnMemories) {
      btnMemories.addEventListener('click', () => this.openMemoriesGallery());
    }

    // 📅 Timeline drawer
    const btnTimeline = document.getElementById('btn-timeline');
    if (btnTimeline) {
      btnTimeline.addEventListener('click', () => {
        const isOpen = this.timelinePanel.classList.toggle('open');
        btnTimeline.classList.toggle('active', isOpen);
      });
    }

    const timelineClose = document.getElementById('timeline-close');
    if (timelineClose) {
      timelineClose.addEventListener('click', () => {
        this.timelinePanel.classList.remove('open');
        if (btnTimeline) btnTimeline.classList.remove('active');
      });
    }

    const btnTimelinePlay = document.getElementById('btn-timeline-play');
    if (btnTimelinePlay) {
      btnTimelinePlay.addEventListener('click', () => this.toggleTimelinePlay());
    }

    // 🎨 Renaissance Painting Mood
    const btnPainting = document.getElementById('btn-painting-mood');
    if (btnPainting) {
      btnPainting.addEventListener('click', () => {
        const active = this.paintingOverlay.classList.toggle('active');
        btnPainting.classList.toggle('active', active);
        this.galaxy.setPaintingMood(active);
      });
    }

    // 🖼️ Share Poster
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
      btnShare.addEventListener('click', () => this.openShareModal());
    }

    const btnDownloadShare = document.getElementById('btn-download-share-card');
    if (btnDownloadShare) {
      btnDownloadShare.addEventListener('click', () => this.downloadShareCard());
    }

    // ◎ Forgotten ideas
    const btnForgotten = document.getElementById('btn-forgotten');
    if (btnForgotten) {
      btnForgotten.addEventListener('click', () => {
        const abandoned = (this.graphData?.nodes || []).filter(n => n.status === 'abandoned');
        if (!abandoned.length) return;
        const nodeIds = abandoned.map(n => n.id);
        this.galaxy.setHighlight('abandoned', nodeIds, []);
        this.setMode('◎ Forgotten Ideas');
        if (abandoned[0]) this.galaxy.focusNode(abandoned[0].id);
      });
    }

    // ◈ Hidden connections
    const btnHidden = document.getElementById('btn-hidden');
    if (btnHidden) {
      btnHidden.addEventListener('click', () => {
        const connections = this.graphData?.insights?.hiddenConnections;
        if (!connections?.length) return;
        this.revealHiddenConnection(connections[0]);
      });
    }

    // ✦ Ask Mirror
    const btnAsk = document.getElementById('btn-ask');
    if (btnAsk) {
      btnAsk.addEventListener('click', () => {
        this.askPanel.open();
        this.inspector.close();
      });
    }

    // Demo button
    const btnDemo = document.getElementById('btn-demo');
    if (btnDemo) {
      btnDemo.addEventListener('click', () => this.loadDemoData());
    }

    // Add thoughts button
    const btnAddThoughts = document.getElementById('btn-add-thoughts');
    if (btnAddThoughts) {
      btnAddThoughts.addEventListener('click', () => this.openInputModal());
    }

    // Mode exit
    const modeExit = document.getElementById('mode-exit');
    if (modeExit) {
      modeExit.addEventListener('click', () => this.clearMode());
    }

    // Input modal actions
    const btnExtract = document.getElementById('btn-extract');
    if (btnExtract) {
      btnExtract.addEventListener('click', () => {
        const text = document.getElementById('user-text-input')?.value.trim() || '';
        if (text.length < 50) {
          alert('Please enter at least a few thoughts (50+ characters).');
          return;
        }
        this.extractFromText(text);
      });
    }

    const btnCancelExtract = document.getElementById('btn-cancel-extract');
    if (btnCancelExtract) {
      btnCancelExtract.addEventListener('click', () => this.closeInputModal());
    }

    const btnCloseInput = document.getElementById('btn-close-input-modal');
    if (btnCloseInput) {
      btnCloseInput.addEventListener('click', () => this.closeInputModal());
    }

    const btnUseDemo = document.getElementById('btn-use-demo');
    if (btnUseDemo) {
      btnUseDemo.addEventListener('click', () => {
        this.loadDemoData();
        this.closeInputModal();
      });
    }

    // Close modals on backdrop click or close buttons
    const closeModals = [
      { id: 'btn-close-memories-gallery', overlay: 'memories-gallery-overlay' },
      { id: 'btn-done-memories-gallery', overlay: 'memories-gallery-overlay' },
      { id: 'btn-close-share-modal', overlay: 'share-modal-overlay' },
      { id: 'btn-cancel-share', overlay: 'share-modal-overlay' },
      { id: 'btn-close-lightbox', overlay: 'lightbox-overlay' }
    ];

    closeModals.forEach(m => {
      const el = document.getElementById(m.id);
      if (el) {
        el.addEventListener('click', () => {
          const ov = document.getElementById(m.overlay);
          if (ov) ov.classList.remove('modal-overlay--open');
        });
      }
    });

    ['memories-gallery-overlay', 'share-modal-overlay', 'lightbox-overlay', 'hidden-modal-overlay', 'input-modal'].forEach(ovId => {
      const ov = document.getElementById(ovId);
      if (ov) {
        ov.addEventListener('click', (e) => {
          if (e.target === ov) ov.classList.remove('modal-overlay--open');
        });
      }
    });
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  window.mirrorApp = new MirrorApp();
});
