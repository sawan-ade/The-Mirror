// ============================================================
// THE MIRROR — Node Inspector Panel v2
// Orchestrate Dark Aesthetics + Photo Memories + Voice Notes
// ============================================================

class Inspector {
  constructor(galaxyCanvas, graphDataRef) {
    this.galaxy = galaxyCanvas;
    this.graphDataRef = graphDataRef;
    this.panel = document.getElementById('inspector-panel');
    this.body = document.getElementById('inspector-body');
    this.currentNode = null;
    this.onWhyConnected = null;
    this.onOpenLightbox = null;
    this.onPhotoAdded = null;

    // Media recorder state
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;

    const closeBtn = document.getElementById('inspector-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  open(node) {
    this.currentNode = node;
    this.loadUserPersistedMemories(node);
    this.render(node);
    this.panel.classList.add('open');
    this.panel.classList.add('inspector-panel--open');
    this.galaxy.selectNode(node.id);
  }

  close() {
    this.panel.classList.remove('open');
    this.panel.classList.remove('inspector-panel--open');
    this.galaxy.selectedNode = null;
    this.currentNode = null;
  }

  loadUserPersistedMemories(node) {
    try {
      const stored = localStorage.getItem(`mirror_memories_${node.id}`);
      if (stored) {
        const extra = JSON.parse(stored);
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
      console.warn('Could not read localStorage memories', e);
    }
  }

  saveUserPersistedMemories(node) {
    try {
      if (node && node.photos) {
        localStorage.setItem(`mirror_memories_${node.id}`, JSON.stringify(node.photos));
      }
    } catch (e) {
      console.warn('Could not write localStorage memories', e);
    }
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
    const statusClass = `status--${node.status || 'normal'}`;

    const photos = node.photos || [];
    const voiceNotes = node.voiceNotes || [];

    let html = `
      <div class="inspector-cluster-tag" style="border-color:${clusterColor}40; color:${clusterColor}; background:${clusterColor}12;">
        <span>●</span> ${cluster?.label || node.cluster}
      </div>

      <h2 class="inspector-title">${this.escapeHtml(node.label)}</h2>

      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <span class="inspector-status ${statusClass}">${node.status || 'Active'}</span>
        ${photos.length ? `<span style="font-size:11px; color:var(--green); display:flex; align-items:center; gap:4px;"><span style="font-size:12px;">📸</span> ${photos.length} visual ${photos.length === 1 ? 'memory' : 'memories'}</span>` : ''}
      </div>

      <div class="inspector-stats">
        <div class="inspector-stat-box">
          <div class="inspector-stat-label">Mentions</div>
          <div class="inspector-stat-value">${node.mentions || 1}</div>
        </div>
        <div class="inspector-stat-box">
          <div class="inspector-stat-label">Cognitive Weight</div>
          <div class="inspector-stat-value">${((node.weight || 0.5) * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div class="inspector-timeline">
        <div class="inspector-timeline-label">Temporal Evolution</div>
        <div class="timeline-bar">
          <div class="timeline-bar-fill" style="width: ${Math.max(20, Math.min(100, (node.weight || 0.6) * 100))}%;"></div>
        </div>
        <div class="timeline-dates">
          <span>First: ${node.firstSeen || 'March 2024'}</span>
          <span>Last: ${node.lastSeen || 'Present'}</span>
        </div>
      </div>

      <!-- ─── Visual Memories ────────────────────────── -->
      <div class="section-heading" style="display:flex; justify-content:space-between; align-items:center;">
        <span>📸 Visual Memories (${photos.length})</span>
      </div>
      <div class="photo-memory-section">
    `;

    if (photos.length > 0) {
      photos.forEach(photo => {
        html += `
          <div class="photo-memory-card" data-photoid="${photo.id}">
            <img src="${photo.url}" alt="${this.escapeHtml(photo.caption || node.label)}" />
            <div class="photo-memory-card__info">
              <div class="photo-memory-card__caption">"${this.escapeHtml(photo.caption || '')}"</div>
              <div class="photo-memory-card__date">${photo.date || ''}</div>
            </div>
            <button class="photo-memory-card__delete" title="Remove photo" data-delid="${photo.id}">✕</button>
          </div>
        `;
      });
    } else {
      html += `
        <div style="background:var(--surface-2); border:1px dashed var(--border); border-radius:8px; padding:14px; text-align:center; margin-bottom:10px;">
          <p style="font-size:12px; color:var(--text-muted); margin:0;">No visual memories attached to this thought yet.</p>
        </div>
      `;
    }

    html += `
        <div style="display:flex; gap:8px;">
          <label class="btn-add-photo" style="flex:1;">
            <input type="file" id="file-photo-upload" accept="image/*" style="display:none;" />
            <span>＋ Upload Photo Memory</span>
          </label>
          <button class="btn-add-photo" id="btn-sample-memory" style="width:auto; padding:8px 12px;" title="Attach inspiration photo">
            ＋ Preset
          </button>
        </div>
      </div>

      <!-- ─── Voice Note ─────────────────────────────── -->
      <div class="section-heading">🎙️ Voice Thoughts</div>
      <div class="voice-section">
    `;

    if (voiceNotes.length > 0) {
      voiceNotes.forEach(v => {
        html += `
          <div class="voice-recorder" style="margin-bottom:8px;">
            <button class="voice-btn btn-play-voice" data-text="${this.escapeHtml(v.text || v.title)}" title="Play voice note">▶</button>
            <div class="voice-label">
              <strong style="color:var(--warm-white); display:block;">${this.escapeHtml(v.title)}</strong>
              <span style="font-size:11px; color:var(--text-muted);">${v.date} · ${v.duration || '0:20'}</span>
            </div>
            <div class="voice-waveform">
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
              <span class="voice-bar"></span>
            </div>
          </div>
        `;
      });
    }

    html += `
        <div class="voice-recorder">
          <button class="voice-btn" id="btn-record-voice" title="Record or reflect voice note">●</button>
          <div class="voice-label" id="voice-record-status">Click to record a voice memory for this thought</div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- ─── AI Interpretation ──────────────────────── -->
      <div class="mirror-interpretation">
        <div class="mirror-interpretation__label">
          <span>◈</span> THE MIRROR'S INTERPRETATION
        </div>
        <div class="mirror-interpretation__text">${node.aiInterpretation || 'No cognitive interpretation available.'}</div>
      </div>

      <!-- ─── Source Excerpts ────────────────────────── -->
      ${node.sourceExcerpts?.length ? `
        <div class="section-heading">Raw Thought Excerpts</div>
        <div class="excerpt-list">
          ${node.sourceExcerpts.slice(0, 3).map(ex => `<div class="excerpt-item">${this.escapeHtml(ex)}</div>`).join('')}
        </div>
      ` : ''}

      <!-- ─── Connected Concepts ─────────────────────── -->
      ${relatedNodes.length ? `
        <div class="section-heading">Connected Concepts (${relatedNodes.length})</div>
        <div class="related-nodes">
          ${relatedNodes.map(r => `<button class="related-node-chip" data-id="${r.id}">● ${this.escapeHtml(r.label)}</button>`).join('')}
        </div>
      ` : ''}

      <!-- ─── Why Connected Explanations ─────────────── -->
      ${relatedNodes.length ? `
        <div class="section-heading">Explore Relationship</div>
        ${relatedNodes.slice(0, 3).map(r => `
          <button class="why-btn" data-nodea="${node.id}" data-nodeb="${r.id}">
            <span style="color:var(--green); font-size:14px;">◎</span>
            Why is <strong style="color:var(--text-primary); margin:0 3px;">${this.escapeHtml(node.label)}</strong> connected to <strong style="color:var(--text-primary); margin:0 3px;">${this.escapeHtml(r.label)}</strong>?
          </button>
        `).join('')}
      ` : ''}
    `;

    this.body.innerHTML = html;

    // Attach interactive listeners
    this.bindEvents(node, graphData);
  }

  bindEvents(node, graphData) {
    // Lightbox on photo click
    this.body.querySelectorAll('.photo-memory-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.photo-memory-card__delete')) return;
        const photoId = card.dataset.photoid;
        const photo = (node.photos || []).find(p => p.id === photoId);
        if (photo && this.onOpenLightbox) {
          this.onOpenLightbox(photo, node);
        }
      });
    });

    // Delete photo
    this.body.querySelectorAll('.photo-memory-card__delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const delId = btn.dataset.delid;
        node.photos = (node.photos || []).filter(p => p.id !== delId);
        this.saveUserPersistedMemories(node);
        this.render(node);
        if (this.onPhotoAdded) this.onPhotoAdded(node);
      });
    });

    // File photo upload
    const fileInput = this.body.querySelector('#file-photo-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const newPhoto = {
            id: 'up_' + Date.now(),
            url: evt.target.result,
            caption: prompt('Add an optional memory caption for this photo:', 'Captured thought') || 'Personal memory',
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };
          if (!node.photos) node.photos = [];
          node.photos.push(newPhoto);
          this.saveUserPersistedMemories(node);
          this.render(node);
          if (this.onPhotoAdded) this.onPhotoAdded(node);
        };
        reader.readAsDataURL(file);
      });
    }

    // Sample preset photo
    const sampleBtn = this.body.querySelector('#btn-sample-memory');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        const presets = [
          { url: 'img/memory-deep-work.jpg', caption: 'Quiet early morning block with coffee and fresh thoughts.' },
          { url: 'img/memory-startup.jpg', caption: 'Whiteboard roadmap and system architectural sketches.' },
          { url: 'img/memory-meditation.jpg', caption: 'Mindfulness space and calm morning sunlight.' },
          { url: 'img/memory-reading.jpg', caption: 'Philosophy books and handwritten reflection notes.' }
        ];
        const pick = presets[Math.floor(Math.random() * presets.length)];
        const newPhoto = {
          id: 'sample_' + Date.now(),
          url: pick.url,
          caption: pick.caption,
          date: 'September 2025'
        };
        if (!node.photos) node.photos = [];
        node.photos.push(newPhoto);
        this.saveUserPersistedMemories(node);
        this.render(node);
        if (this.onPhotoAdded) this.onPhotoAdded(node);
      });
    }

    // Voice record button
    const recordBtn = this.body.querySelector('#btn-record-voice');
    const recordStatus = this.body.querySelector('#voice-record-status');
    if (recordBtn) {
      recordBtn.addEventListener('click', async () => {
        if (!this.isRecording) {
          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              this.mediaRecorder = new MediaRecorder(stream);
              this.audioChunks = [];
              this.mediaRecorder.ondataavailable = (ev) => this.audioChunks.push(ev.data);
              this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                if (!node.voiceNotes) node.voiceNotes = [];
                node.voiceNotes.push({
                  id: 'voice_' + Date.now(),
                  title: `Voice Thought on ${node.label}`,
                  date: 'Just now',
                  duration: '0:12',
                  url: audioUrl,
                  text: `User recorded voice note reflecting on ${node.label}.`
                });
                this.render(node);
              };
              this.mediaRecorder.start();
              this.isRecording = true;
              recordBtn.classList.add('recording');
              recordBtn.textContent = '■';
              recordStatus.textContent = 'Recording your thought... Click ■ to finish';
            } else {
              throw new Error('No mic available');
            }
          } catch (err) {
            // Simulated voice reflection fallback
            const thoughtText = prompt(`Speak or type your reflection on "${node.label}":`, `Reflecting on ${node.label} and how it shapes my focus.`);
            if (thoughtText) {
              if (!node.voiceNotes) node.voiceNotes = [];
              node.voiceNotes.push({
                id: 'voice_' + Date.now(),
                title: `Reflection on ${node.label}`,
                date: 'Just now',
                duration: '0:18',
                text: thoughtText
              });
              this.render(node);
            }
          }
        } else {
          // Stop recording
          if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            recordBtn.classList.remove('recording');
            recordBtn.textContent = '●';
          }
        }
      });
    }

    // Voice playback buttons
    this.body.querySelectorAll('.btn-play-voice').forEach(playBtn => {
      playBtn.addEventListener('click', () => {
        const text = playBtn.dataset.text;
        if ('speechSynthesis' in window && text) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(text);
          utter.rate = 0.95;
          utter.pitch = 1.0;
          playBtn.textContent = '⏸';
          utter.onend = () => { playBtn.textContent = '▶'; };
          utter.onerror = () => { playBtn.textContent = '▶'; };
          window.speechSynthesis.speak(utter);
        } else {
          alert(`Voice thought: "${text}"`);
        }
      });
    });

    // Related node chips
    this.body.querySelectorAll('.related-node-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.id;
        const target = (graphData.nodes || []).find(n => n.id === targetId);
        if (target) {
          this.open(target);
          this.galaxy.focusNode(targetId);
        }
      });
    });

    // Why connected buttons
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

  showWhyResult(explanation, btn) {
    const result = document.createElement('div');
    result.className = 'mirror-interpretation';
    result.style.marginBottom = '12px';
    result.innerHTML = `
      <div class="mirror-interpretation__label">
        ◈ Connection: ${this.escapeHtml(explanation.connectionType || 'Thematic')} (${this.escapeHtml(explanation.strength || 'Direct')})
      </div>
      <div class="mirror-interpretation__text">${this.escapeHtml(explanation.explanation || '')}</div>
      ${explanation.directEvidence?.map(e => `<div class="excerpt-item" style="margin-top:8px;">${this.escapeHtml(e)}</div>`).join('') || ''}
    `;
    btn.parentNode.replaceChild(result, btn);
  }

  clusterColorByKey(colorKey) {
    const map = {
      violet:  '#7C3AED', // Electric violet
      blue:    '#0284C7', // Ocean cyan
      cyan:    '#0EA5E9', // Sky blue
      rose:    '#E11D48', // Coral rose
      amber:   '#D97706', // Radiant amber
      emerald: '#059669', // Emerald mint
      orange:  '#EA580C'  // Sunset orange
    };
    return map[colorKey] || '#7C3AED';
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
