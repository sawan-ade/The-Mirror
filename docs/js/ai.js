// ============================================================
// THE MIRROR — AI API Module
// Dual mode: backend proxy OR direct browser Anthropic API
// ============================================================

const AI = (() => {
  const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
  const MODEL = 'claude-sonnet-4-5';

  // ─── Key management ────────────────────────────────────────
  function getApiKey() {
    return sessionStorage.getItem('mirror_api_key') || '';
  }

  function setApiKey(key) {
    sessionStorage.setItem('mirror_api_key', key);
  }

  function promptForKey() {
    const existing = getApiKey();
    const key = prompt(
      '◈ THE MIRROR\n\nEnter your Anthropic API key to enable AI features.\n' +
      'Get one at: console.anthropic.com\n\n' +
      'Your key is stored only in this browser session — never sent to any server except Anthropic.',
      existing || 'sk-ant-...'
    );
    if (key && key.startsWith('sk-ant-')) {
      setApiKey(key);
      return key;
    }
    if (key) alert('That does not look like a valid Anthropic key. Keys start with sk-ant-');
    return null;
  }

  // ─── Backend proxy call ────────────────────────────────────
  async function backendRequest(endpoint, body) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
    return res.json();
  }

  // ─── Direct Anthropic call (CORS-enabled by Anthropic) ────
  async function directRequest(systemPrompt, userContent, maxTokens = 4096) {
    let key = getApiKey();
    if (!key) key = promptForKey();
    if (!key) throw new Error('No API key provided.');

    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic API error ${res.status}`);
    }
    const data = await res.json();
    const raw = data.content?.[0]?.text || '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    try { return JSON.parse(cleaned); } catch (e) { return { answer: raw, evidence: [], type: 'observation', supportingNodes: [] }; }
  }

  // ─── Check if backend is available ────────────────────────
  let _backendAvailable = null;
  async function isBackendAvailable() {
    if (_backendAvailable !== null) return _backendAvailable;
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
      _backendAvailable = res.ok;
    } catch {
      _backendAvailable = false;
    }
    return _backendAvailable;
  }

  // ─── Prompts (same as backend) ─────────────────────────────
  const EXTRACT_SYSTEM = `You are the cognitive engine of THE MIRROR — an AI that transforms a person's unstructured thoughts into a structured intellectual map.

Your task is to analyze the provided text and extract a rich, meaningful graph of concepts, relationships, and insights.

YOU MUST RESPOND WITH VALID JSON ONLY. No prose. No markdown fences. Just raw JSON.

EXTRACTION RULES:
1. Extract 15-30 meaningful concepts (avoid trivial words)
2. A "concept" can be: an idea, project, interest, goal, fear, question, person, emotion, recurring theme
3. Weight nodes by frequency of mention and importance
4. Group nodes into 4-7 meaningful clusters with evocative names
5. Find 20-40 meaningful relationships between concepts
6. Identify: recurring concepts, emerging ideas, abandoned ideas, hidden cross-domain connections
7. Extract representative source quotes for each concept
8. Detect temporal information if dates/times are mentioned
9. Do NOT psychoanalyze or make mental health claims.

RESPOND WITH THIS JSON STRUCTURE:
{"nodes":[{"id","label","cluster","weight","mentions","status","firstSeen","lastSeen","sourceExcerpts":[],"aiInterpretation"}],"edges":[{"id","source","target","strength","type","label","evidence"}],"clusters":[{"id","label","theme","colorKey"}],"insights":{"recurring":[],"abandoned":[],"emerging":[],"hiddenConnections":[],"evolution":[],"dominantTheme","mirrorObservation"},"metadata":{"totalThoughts","dateRange","conceptCount","clusterCount","dominantClusters":[]}}`;

  const ASK_SYSTEM = `You are THE MIRROR — a wise, introspective AI that helps users understand their own intellectual landscape.
Answer using ONLY evidence from the provided map. RESPOND WITH VALID JSON ONLY:
{"answer":"The substantive answer","supportingNodes":["id1"],"evidence":["quote"],"type":"observation|pattern|connection|question|evolution"}`;

  const EXPLAIN_SYSTEM = `You are THE MIRROR. Explain why two specific concepts are connected.
RESPOND WITH VALID JSON ONLY:
{"explanation":"Why these concepts connect","directEvidence":["quote"],"connectionType":"direct|thematic|emotional|temporal|causal","strength":"strong|moderate|subtle"}`;

  // ─── Public API ────────────────────────────────────────────
  return {
    setApiKey,
    promptForKey,
    getApiKey,

    async extract(text) {
      if (await isBackendAvailable()) return backendRequest('/extract', { text });
      return directRequest(EXTRACT_SYSTEM, `Analyze these thoughts:\n\n${text}`, 8192);
    },

    async ask(question, graphContext) {
      const ctx = JSON.stringify({ nodes: graphContext.nodes?.slice(0,30), edges: graphContext.edges?.slice(0,40), clusters: graphContext.clusters, insights: graphContext.insights });
      if (await isBackendAvailable()) return backendRequest('/ask', { question, graphContext });
      return directRequest(ASK_SYSTEM, `Graph:\n${ctx}\n\nQuestion: ${question}`, 1024);
    },

    async explain(nodeA, nodeB, graphContext) {
      const ctx = JSON.stringify({ nodes: graphContext.nodes, edges: graphContext.edges?.filter(e => e.source===nodeA.id||e.target===nodeA.id||e.source===nodeB.id||e.target===nodeB.id) });
      if (await isBackendAvailable()) return backendRequest('/explain', { nodeA, nodeB, graphContext });
      return directRequest(EXPLAIN_SYSTEM, `Graph:\n${ctx}\n\nExplain: "${nodeA.label}" ↔ "${nodeB.label}"`, 768);
    }
  };
})();
