// ============================================================
// THE MIRROR — Main App Orchestrator
// Wires together: Canvas, Inspector, AskPanel, Modals
// ============================================================

class MirrorApp {
  constructor() {
    this.graphData = null;
    this.usingDemo = false;

    // Core modules
    this.galaxy = null;
    this.inspector = null;
    this.askPanel = null;

    // DOM refs
    this.processingOverlay = document.getElementById('processing-overlay');
    this.processingText = document.getElementById('processing-text');
    this.processingTextEl = document.getElementById('processing-text-main');
    this.inputModal = document.getElementById('input-modal');
    this.modeIndicator = document.getElementById('mode-indicator');
    this.modeLabel = document.getElementById('mode-label');
    this.tooltip = document.getElementById('node-tooltip');

    this.init();
  }

  init() {
    // Initialize canvas
    const canvasEl = document.getElementById('mirror-canvas');
    this.galaxy = new GalaxyCanvas(canvasEl);

    // Initialize inspector
    this.inspector = new Inspector(
      this.galaxy,
      () => this.graphData
    );

    // Initialize ask panel
    this.askPanel = new AskPanel(() => this.graphData);

    // Wire inspector → why connection → AI call
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

    // Wire ask panel → highlight nodes on graph
    this.askPanel.onHighlightNodes = (nodeIds) => {
      if (nodeIds.length) {
        this.galaxy.setHighlight('question', nodeIds, []);
      } else {
        this.galaxy.clearHighlight();
      }
    };

    // Wire galaxy → node click → inspector
    this.galaxy.onNodeClick = (node) => {
      this.inspector.open(node);
    };

    // Wire galaxy → hover → tooltip
    this.galaxy.onNodeHover = (node, x, y) => {
      this.updateTooltip(node, x, y);
    };

    // Load demo data immediately
    this.loadDemoData();

    // Build legend
    this.buildLegend();

    // Bind nav buttons
    this.bindNavEvents();

    // Update stats
    this.updateStats();
  }

  // ─────────────────────────────────────────────
  // Data loading
  // ─────────────────────────────────────────────

  loadDemoData() {
    this.graphData = window.DEMO_DATA;
    this.usingDemo = true;
    this.galaxy.loadGraph(this.graphData);
    this.buildLegend();
    this.updateStats();
    this.showInsightToasts();
  }

  async extractFromText(text) {
    this.showProcessing('Extracting concepts…', 'Reading your thoughts');
    try {
      const data = await AI.extract(text);
      this.graphData = data;
      this.usingDemo = false;
      this.galaxy.loadGraph(data);
      this.buildLegend();
      this.updateStats();
      this.hideProcessing();
      this.closeInputModal();
      // Show hidden connections toast after a delay
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
    document.getElementById('processing-text-main').textContent = text;
    document.getElementById('processing-sub').textContent = sub;
    this.processingOverlay.classList.add('processing-overlay--active');
  }

  hideProcessing() {
    this.processingOverlay.classList.remove('processing-overlay--active');
  }

  updateTooltip(node, x, y) {
    if (!node) {
      this.tooltip.classList.remove('node-tooltip--visible');
      return;
    }
    this.tooltip.querySelector('.node-tooltip__label').textContent = node.label;
    this.tooltip.querySelector('.node-tooltip__meta').textContent =
      `${node.mentions} mentions · ${node.status}`;
    this.tooltip.style.left = `${x + 14}px`;
    this.tooltip.style.top = `${y - 10}px`;
    this.tooltip.classList.add('node-tooltip--visible');
  }

  buildLegend() {
    if (!this.graphData?.clusters) return;
    const legend = document.getElementById('cluster-legend');
    legend.innerHTML = '';
    this.graphData.clusters.forEach(c => {
      const color = this.clusterColorByKey(c.colorKey);
      const item = document.createElement('div');
      item.className = 'cluster-legend__item';
      item.innerHTML = `
        <div class="cluster-dot" style="background:${color};box-shadow:0 0 6px ${color}60;"></div>
        <span class="cluster-legend__label">${c.label}</span>
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
    document.getElementById('stat-nodes').textContent = nodes;
    document.getElementById('stat-edges').textContent = edges;
    document.getElementById('stat-clusters').textContent = clusters;
    if (this.graphData.metadata?.dateRange) {
      document.getElementById('stat-range').textContent = this.graphData.metadata.dateRange;
    }
  }

  showInsightToasts() {
    if (!this.graphData?.insights?.hiddenConnections?.length) return;
    const container = document.getElementById('insight-toast-container');
    container.innerHTML = '';

    // Show one compelling hidden connection toast
    const hidden = this.graphData.insights.hiddenConnections[0];
    if (hidden) {
      const nodeA = this.graphData.nodes?.find(n => n.id === hidden.nodeA);
      const nodeB = this.graphData.nodes?.find(n => n.id === hidden.nodeB);
      if (nodeA && nodeB) {
        const toast = document.createElement('div');
        toast.className = 'insight-toast';
        toast.innerHTML = `
          <span class="insight-toast__icon">◈</span>
          Hidden connection found: <strong style="color:var(--text-primary);margin:0 4px;">${nodeA.label}</strong>
          ↔
          <strong style="color:var(--text-primary);margin:0 4px;">${nodeB.label}</strong>
        `;
        toast.addEventListener('click', () => {
          this.revealHiddenConnection(hidden);
          container.innerHTML = '';
        });
        container.appendChild(toast);

        // Auto-dismiss after 8 seconds
        setTimeout(() => { container.innerHTML = ''; }, 8000);
      }
    }
  }

  revealHiddenConnection(connection) {
    const nodeIds = [connection.nodeA, connection.nodeB];
    this.galaxy.setHighlight('hidden', nodeIds, []);
    this.setMode('◈ Hidden Connection');

    // Show modal-style explanation
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
          <div class="modal-title">◈ Hidden Connection Revealed</div>
          <div class="modal-subtitle">A non-obvious relationship discovered in your thinking</div>
        </div>
        <button class="panel-close-btn" onclick="document.getElementById('hidden-modal-overlay').classList.remove('modal-overlay--open')">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
          <span style="padding:6px 14px; border:1px solid rgba(236,72,153,0.3); border-radius:50px; color:var(--rose); font-size:14px; font-weight:600;">${nodeA.label}</span>
          <span style="color:var(--text-dim);">↔</span>
          <span style="padding:6px 14px; border:1px solid rgba(236,72,153,0.3); border-radius:50px; color:var(--rose); font-size:14px; font-weight:600;">${nodeB.label}</span>
        </div>

        <div class="ai-interpretation" style="margin-bottom:20px;">
          <div class="ai-interpretation__label">◈ Mirror Hypothesis</div>
          <div class="ai-interpretation__text">${connection.hypothesis}</div>
        </div>

        <div class="section-heading">Supporting Evidence</div>
        <div class="excerpt-list">
          <div class="excerpt-item">${connection.evidence}</div>
        </div>

        <div style="margin-top:16px; display:flex; align-items:center; gap:8px;">
          <span class="section-heading" style="margin:0;">Connection Strength</span>
          <div style="flex:1; height:3px; background:var(--bg-panel-border); border-radius:2px; overflow:hidden;">
            <div style="height:100%; width:${(connection.strength * 100).toFixed(0)}%; background:linear-gradient(90deg,var(--rose),var(--violet-bright));"></div>
          </div>
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--text-secondary);">${(connection.strength * 100).toFixed(0)}%</span>
        </div>
      </div>
    `;

    overlay.classList.add('modal-overlay--open');
  }

  setMode(label) {
    this.modeLabel.textContent = label;
    this.modeIndicator.classList.add('mode-indicator--visible');
  }

  clearMode() {
    this.modeIndicator.classList.remove('mode-indicator--visible');
    this.galaxy.clearHighlight();
  }

  openInputModal() {
    document.getElementById('input-modal').classList.add('modal-overlay--open');
    document.getElementById('user-text-input').focus();
  }

  closeInputModal() {
    document.getElementById('input-modal').classList.remove('modal-overlay--open');
  }

  clusterColorByKey(colorKey) {
    const map = {
      violet:'#9D7FEA', blue:'#60A5FA', cyan:'#22D3EE',
      rose:'#F472B6', amber:'#FBB040', emerald:'#34D399', orange:'#FB923C'
    };
    return map[colorKey] || '#9D7FEA';
  }

  // ─────────────────────────────────────────────
  // Nav button bindings
  // ─────────────────────────────────────────────

  bindNavEvents() {
    // Add thoughts button
    document.getElementById('btn-add-thoughts').addEventListener('click', () => {
      this.openInputModal();
    });

    // Demo mode button
    document.getElementById('btn-demo').addEventListener('click', () => {
      this.loadDemoData();
    });

    // Ask Mirror button
    document.getElementById('btn-ask').addEventListener('click', () => {
      this.askPanel.open();
      this.inspector.close();
    });

    // Forgotten ideas button
    document.getElementById('btn-forgotten').addEventListener('click', () => {
      const abandoned = (this.graphData?.nodes || []).filter(n => n.status === 'abandoned');
      if (!abandoned.length) return;
      const nodeIds = abandoned.map(n => n.id);
      this.galaxy.setHighlight('abandoned', nodeIds, []);
      this.setMode('◎ Forgotten Ideas');
      // Auto-focus on the first abandoned node
      if (abandoned[0]) this.galaxy.focusNode(abandoned[0].id);
    });

    // Hidden connections button
    document.getElementById('btn-hidden').addEventListener('click', () => {
      const connections = this.graphData?.insights?.hiddenConnections;
      if (!connections?.length) return;
      // Reveal first hidden connection
      this.revealHiddenConnection(connections[0]);
    });

    // Mode indicator exit
    document.getElementById('mode-exit').addEventListener('click', () => {
      this.clearMode();
    });

    // Input modal submit
    document.getElementById('btn-extract').addEventListener('click', () => {
      const text = document.getElementById('user-text-input').value.trim();
      if (text.length < 50) {
        alert('Please enter at least a few thoughts (50+ characters).');
        return;
      }
      this.extractFromText(text);
    });

    // Input modal cancel
    document.getElementById('btn-cancel-extract').addEventListener('click', () => {
      this.closeInputModal();
    });

    // Input modal demo
    document.getElementById('btn-use-demo').addEventListener('click', () => {
      this.loadDemoData();
      this.closeInputModal();
    });

    // Close hidden modal on backdrop click
    document.getElementById('hidden-modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('hidden-modal-overlay')) {
        document.getElementById('hidden-modal-overlay').classList.remove('modal-overlay--open');
      }
    });

    // Input modal backdrop close
    document.getElementById('input-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('input-modal')) {
        this.closeInputModal();
      }
    });
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  window.mirrorApp = new MirrorApp();
});
