// ============================================================
// THE MIRROR — Node Inspector Panel
// ============================================================

class Inspector {
  constructor(galaxyCanvas, graphDataRef) {
    this.galaxy = galaxyCanvas;
    this.graphDataRef = graphDataRef; // function that returns current graph
    this.panel = document.getElementById('inspector-panel');
    this.body = document.getElementById('inspector-body');
    this.currentNode = null;
    this.onWhyConnected = null; // callback(nodeA, nodeB)

    document.getElementById('inspector-close').addEventListener('click', () => this.close());
  }

  open(node) {
    this.currentNode = node;
    this.render(node);
    this.panel.classList.add('inspector-panel--open');
    this.galaxy.selectNode(node.id);
  }

  close() {
    this.panel.classList.remove('inspector-panel--open');
    this.galaxy.selectedNode = null;
    this.currentNode = null;
  }

  render(node) {
    const graphData = this.graphDataRef();

    // Get related nodes from edges
    const relatedIds = new Set();
    (graphData.edges || []).forEach(e => {
      if (e.source === node.id) relatedIds.add(e.target);
      if (e.target === node.id) relatedIds.add(e.source);
    });
    const relatedNodes = (graphData.nodes || []).filter(n => relatedIds.has(n.id));

    const cluster = (graphData.clusters || []).find(c => c.id === node.cluster);
    const clusterColor = this.clusterColorByKey(cluster?.colorKey);
    const statusBadge = this.statusBadge(node.status);

    let html = `
      <div class="node-cluster-tag" style="background: ${clusterColor}18; color: ${clusterColor}; border: 1px solid ${clusterColor}30;">
        <span>●</span> ${cluster?.label || node.cluster}
      </div>

      <h2 class="node-title">${node.label}</h2>

      <div style="display:flex; gap:8px; margin-bottom:20px; align-items:center;">
        ${statusBadge}
      </div>

      <div class="node-meta-grid">
        <div class="node-meta-item">
          <div class="node-meta-item__label">Mentions</div>
          <div class="node-meta-item__value">${node.mentions || '—'}</div>
        </div>
        <div class="node-meta-item">
          <div class="node-meta-item__label">Weight</div>
          <div class="node-meta-item__value">${((node.weight || 0) * 100).toFixed(0)}%</div>
        </div>
        <div class="node-meta-item" style="grid-column: 1 / -1;">
          <div class="node-meta-item__label">Timeline</div>
          <div class="node-meta-item__sub">${node.firstSeen ? `First: ${node.firstSeen}` : 'Unknown'}</div>
          <div class="node-meta-item__sub">${node.lastSeen ? `Last: ${node.lastSeen}` : ''}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="ai-interpretation">
        <div class="ai-interpretation__label">◈ Mirror Interpretation</div>
        <div class="ai-interpretation__text">${node.aiInterpretation || 'No interpretation available.'}</div>
      </div>
    `;

    // Source excerpts
    if (node.sourceExcerpts?.length) {
      html += `<div class="section-heading">Source Thoughts</div>
      <div class="excerpt-list">`;
      node.sourceExcerpts.slice(0, 3).forEach(ex => {
        html += `<div class="excerpt-item">${this.escapeHtml(ex)}</div>`;
      });
      html += `</div>`;
    }

    // Related concepts
    if (relatedNodes.length) {
      html += `<div class="section-heading">Connected Concepts</div>
      <div class="related-nodes">`;
      relatedNodes.slice(0, 8).forEach(related => {
        html += `<button class="related-node-chip" data-id="${related.id}">${related.label}</button>`;
      });
      html += `</div>`;
    }

    // Why connected buttons
    if (relatedNodes.length) {
      html += `<div class="section-heading">Explore Connections</div>`;
      relatedNodes.slice(0, 4).forEach(related => {
        html += `
          <button class="why-btn" data-nodea="${node.id}" data-nodeb="${related.id}">
            <span class="why-icon">◎</span>
            Why is <strong style="color:var(--text-primary);margin:0 4px;">${node.label}</strong>
            connected to
            <strong style="color:var(--text-primary);margin:0 4px;">${related.label}</strong>?
          </button>
        `;
      });
    }

    this.body.innerHTML = html;

    // Bind events
    this.body.querySelectorAll('.related-node-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const n = (graphData.nodes || []).find(n => n.id === id);
        if (n) {
          this.open(n);
          this.galaxy.focusNode(id);
        }
      });
    });

    this.body.querySelectorAll('.why-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const nodeAId = btn.dataset.nodea;
        const nodeBId = btn.dataset.nodeb;
        const nA = graphData.nodes.find(n => n.id === nodeAId);
        const nB = graphData.nodes.find(n => n.id === nodeBId);
        if (nA && nB && this.onWhyConnected) {
          this.onWhyConnected(nA, nB, btn);
        }
      });
    });
  }

  statusBadge(status) {
    const map = {
      active:    '<span class="badge badge--active">Active</span>',
      recurring: '<span class="badge badge--recurring">Recurring</span>',
      emerging:  '<span class="badge badge--emerging">Emerging</span>',
      abandoned: '<span class="badge badge--abandoned">Abandoned</span>'
    };
    return map[status] || '';
  }

  clusterColorByKey(colorKey) {
    const map = {
      violet: '#9D7FEA', blue: '#60A5FA', cyan: '#22D3EE',
      rose: '#F472B6', amber: '#FBB040', emerald: '#34D399', orange: '#FB923C'
    };
    return map[colorKey] || '#9D7FEA';
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  showWhyResult(explanation, btn) {
    // Replace button with result inline
    const result = document.createElement('div');
    result.className = 'ai-interpretation';
    result.style.marginBottom = '12px';
    result.innerHTML = `
      <div class="ai-interpretation__label">◈ Connection Explanation — ${explanation.connectionType} / ${explanation.strength}</div>
      <div class="ai-interpretation__text">${explanation.explanation}</div>
      ${explanation.directEvidence?.map(e => `<div class="excerpt-item" style="margin-top:8px;">${this.escapeHtml(e)}</div>`).join('') || ''}
    `;
    btn.parentNode.replaceChild(result, btn);
  }
}
