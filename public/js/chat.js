// ============================================================
// THE MIRROR — Ask the Mirror Panel
// ============================================================

class AskPanel {
  constructor(graphDataRef) {
    this.graphDataRef = graphDataRef;
    this.panel = document.getElementById('ask-panel');
    this.historyEl = document.getElementById('chat-history');
    this.inputEl = document.getElementById('ask-input');
    this.submitBtn = document.getElementById('ask-submit');
    this.isLoading = false;
    this.onHighlightNodes = null; // callback(nodeIds)

    this.suggestions = [
      "What have I been thinking about most?",
      "What idea do I keep returning to?",
      "What have I abandoned?",
      "What concepts are strongly connected?",
      "What contradictions exist in my thinking?",
      "What connections might I be missing?",
      "What is one high-level observation about my intellectual landscape?",
      "What seems to be emerging in my thinking recently?"
    ];

    this.init();
  }

  init() {
    document.getElementById('ask-close').addEventListener('click', () => this.close());

    // Submit on enter (shift+enter for newline)
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.submit();
      }
    });

    this.submitBtn.addEventListener('click', () => this.submit());

    this.renderSuggestions();
  }

  renderSuggestions() {
    const container = document.getElementById('ask-suggestions');
    container.innerHTML = '';
    // Show 4 random suggestions
    const shuffled = [...this.suggestions].sort(() => 0.5 - Math.random()).slice(0, 4);
    shuffled.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'ask-suggestion';
      btn.textContent = s;
      btn.addEventListener('click', () => {
        this.inputEl.value = s;
        this.submit();
      });
      container.appendChild(btn);
    });
  }

  open() {
    this.panel.classList.add('ask-panel--open');
    setTimeout(() => this.inputEl.focus(), 400);
  }

  close() {
    this.panel.classList.remove('ask-panel--open');
  }

  async submit() {
    const question = this.inputEl.value.trim();
    if (!question || this.isLoading) return;

    this.inputEl.value = '';
    this.isLoading = true;
    this.submitBtn.disabled = true;

    // Add user message
    this.addMessage('user', question);

    // Add loading indicator
    const loadingId = this.addMessage('mirror', null, true);

    try {
      const response = await AI.ask(question, this.graphDataRef());
      this.removeMessage(loadingId);
      this.addMessage('mirror', response);

      // Highlight supporting nodes on the graph
      if (response.supportingNodes?.length && this.onHighlightNodes) {
        this.onHighlightNodes(response.supportingNodes);
        setTimeout(() => {
          if (this.onHighlightNodes) this.onHighlightNodes([]);
        }, 5000);
      }
    } catch (err) {
      this.removeMessage(loadingId);
      this.addMessage('mirror', {
        answer: `The Mirror encountered an issue: ${err.message}`,
        evidence: [],
        type: 'observation'
      });
    }

    this.isLoading = false;
    this.submitBtn.disabled = false;
  }

  addMessage(role, content, isLoading = false) {
    const id = `msg-${Date.now()}-${Math.random()}`;
    const div = document.createElement('div');
    div.id = id;
    div.className = `chat-message chat-message--${role === 'user' ? 'user' : 'mirror'}`;

    if (isLoading) {
      div.innerHTML = `
        <div class="chat-source-label">${role === 'user' ? 'You' : '◈ The Mirror'}</div>
        <div class="chat-bubble">
          <span style="opacity:0.5; font-style:italic; animation: text-blink 1.2s infinite;">Reflecting…</span>
        </div>
      `;
    } else if (role === 'user') {
      div.innerHTML = `
        <div class="chat-source-label">You</div>
        <div class="chat-bubble">${this.escapeHtml(content)}</div>
      `;
    } else {
      // Mirror response
      const typeLabel = this.typeLabel(content.type);
      div.innerHTML = `
        <div class="chat-source-label">◈ The Mirror — <em>${typeLabel}</em></div>
        <div class="chat-bubble">${this.escapeHtml(content.answer)}</div>
        ${content.evidence?.length ? `
          <div class="chat-evidence">
            ${content.evidence.map(e => `<div class="chat-evidence-item">"${this.escapeHtml(e)}"</div>`).join('')}
          </div>
        ` : ''}
      `;
    }

    this.historyEl.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    return id;
  }

  removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  typeLabel(type) {
    const map = {
      observation: 'Observation',
      pattern: 'Pattern',
      connection: 'Connection',
      question: 'Open Question',
      evolution: 'Evolution'
    };
    return map[type] || 'Reflection';
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
