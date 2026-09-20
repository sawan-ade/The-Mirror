require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// ─────────────────────────────────────────────
// EXTRACTION ENDPOINT
// Takes raw text → returns structured graph JSON
// ─────────────────────────────────────────────
app.post('/api/extract', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide at least some text.' });
  }

  const systemPrompt = `You are the cognitive engine of THE MIRROR — an AI that transforms a person's unstructured thoughts into a structured intellectual map.

Your task is to analyze the provided text and extract a rich, meaningful graph of concepts, relationships, and insights.

YOU MUST RESPOND WITH VALID JSON ONLY. No prose. No markdown fences. Just raw JSON.

EXTRACTION RULES:
1. Extract 15-30 meaningful concepts (avoid trivial words like "the", "said", "went")
2. A "concept" can be: an idea, project, interest, goal, fear, question, person, emotion, recurring theme
3. Weight nodes by frequency of mention and importance
4. Group nodes into 4-7 meaningful clusters with evocative names
5. Find 20-40 meaningful relationships between concepts
6. Identify: recurring concepts, emerging ideas, abandoned ideas, hidden cross-domain connections
7. Extract representative source quotes for each concept
8. Detect temporal information if dates/times are mentioned
9. Do NOT psychoanalyze or make mental health claims. Stick to intellectual patterns.

REQUIRED JSON STRUCTURE:
{
  "nodes": [
    {
      "id": "unique_id_snake_case",
      "label": "Concept Name",
      "cluster": "cluster_id",
      "weight": 1.0,
      "mentions": 5,
      "status": "active|recurring|emerging|abandoned",
      "firstSeen": "date string or null",
      "lastSeen": "date string or null",
      "sourceExcerpts": ["quote 1", "quote 2"],
      "aiInterpretation": "What this concept represents in the user's thinking landscape"
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "node_id_1",
      "target": "node_id_2",
      "strength": 0.8,
      "type": "reinforces|contrasts|evolves_into|part_of|causes|questions",
      "label": "short relationship description",
      "evidence": "why these are connected, with quote evidence"
    }
  ],
  "clusters": [
    {
      "id": "cluster_id",
      "label": "Cluster Name",
      "theme": "Brief thematic description",
      "colorKey": "violet|blue|cyan|rose|amber|emerald|orange"
    }
  ],
  "insights": {
    "recurring": [
      { "nodeId": "id", "description": "Why this keeps appearing", "evidence": "quote" }
    ],
    "abandoned": [
      { "nodeId": "id", "description": "What happened to this idea", "lastEvidence": "quote", "lastSeen": "when" }
    ],
    "emerging": [
      { "nodeId": "id", "description": "Why this seems to be growing in importance", "evidence": "quote" }
    ],
    "hiddenConnections": [
      {
        "nodeA": "id1",
        "nodeB": "id2",
        "hypothesis": "The surprising connection between these two",
        "strength": 0.7,
        "evidence": "supporting quotes or reasoning"
      }
    ],
    "evolution": [
      {
        "title": "Evolution story title",
        "nodeIds": ["id1", "id2", "id3"],
        "narrative": "How this idea transformed over time",
        "evidence": ["quote 1", "quote 2"]
      }
    ],
    "dominantTheme": "The single most prominent theme in 1-2 sentences",
    "mirrorObservation": "A thoughtful, non-judgmental high-level observation about this person's intellectual landscape"
  },
  "metadata": {
    "totalThoughts": 42,
    "dateRange": "March 2024 - September 2025",
    "conceptCount": 22,
    "clusterCount": 5,
    "dominantClusters": ["id1", "id2"]
  }
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze these thoughts and extract the intellectual map:\n\n${text}`
        }
      ]
    });

    const rawContent = message.content[0].text;
    // Strip markdown fences if Claude accidentally adds them
    const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    let graphData;
    try {
      graphData = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      console.error('Raw response:', rawContent.substring(0, 500));
      return res.status(500).json({ error: 'AI returned malformed JSON. Please try again.' });
    }

    return res.json(graphData);
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    return res.status(500).json({ error: err.message || 'AI extraction failed.' });
  }
});

// ─────────────────────────────────────────────
// ASK THE MIRROR ENDPOINT
// Takes a question + graph context → returns insight
// ─────────────────────────────────────────────
app.post('/api/ask', async (req, res) => {
  const { question, graphContext } = req.body;
  if (!question || !graphContext) {
    return res.status(400).json({ error: 'Missing question or graph context.' });
  }

  const systemPrompt = `You are THE MIRROR — a wise, introspective AI that helps users understand their own intellectual landscape.

You have been given a structured map of a person's concepts, clusters, relationships, and insights. Answer the user's question about their thinking patterns using ONLY evidence from the provided map.

RESPONSE RULES:
- Be thoughtful, specific, and grounded in evidence.
- Never make psychological diagnoses or mental health claims.
- Clearly distinguish between: source evidence, patterns, and your interpretation.
- Keep answers concise but meaningful (3-6 sentences max).
- Reference specific concept names from the map.
- Speak in second person ("Your thinking shows...", "You frequently return to...")

YOU MUST RESPOND WITH VALID JSON ONLY:
{
  "answer": "The substantive answer to the question",
  "supportingNodes": ["node_id_1", "node_id_2"],
  "evidence": ["Direct quote or evidence 1", "Direct quote or evidence 2"],
  "type": "observation|pattern|connection|question|evolution"
}`;

  const contextStr = JSON.stringify({
    nodes: graphContext.nodes?.slice(0, 30),
    edges: graphContext.edges?.slice(0, 40),
    clusters: graphContext.clusters,
    insights: graphContext.insights
  });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Graph Map:\n${contextStr}\n\nQuestion: ${question}`
        }
      ]
    });

    const rawContent = message.content[0].text;
    const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    let response;
    try {
      response = JSON.parse(cleaned);
    } catch (e) {
      response = {
        answer: rawContent,
        supportingNodes: [],
        evidence: [],
        type: 'observation'
      };
    }

    return res.json(response);
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    return res.status(500).json({ error: err.message || 'Mirror query failed.' });
  }
});

// ─────────────────────────────────────────────
// EXPLAIN CONNECTION ENDPOINT
// Explains why two nodes are connected
// ─────────────────────────────────────────────
app.post('/api/explain', async (req, res) => {
  const { nodeA, nodeB, graphContext } = req.body;

  const systemPrompt = `You are THE MIRROR. Explain why two specific concepts in the user's intellectual landscape are connected.
Use only evidence from the provided graph. Be specific, insightful, and grounded.

RESPOND WITH VALID JSON ONLY:
{
  "explanation": "Why these concepts are connected",
  "directEvidence": ["quote 1", "quote 2"],
  "connectionType": "direct|thematic|emotional|temporal|causal",
  "strength": "strong|moderate|subtle"
}`;

  const contextStr = JSON.stringify({
    nodes: graphContext.nodes,
    edges: graphContext.edges?.filter(e =>
      (e.source === nodeA.id || e.target === nodeA.id ||
       e.source === nodeB.id || e.target === nodeB.id)
    ),
    insights: graphContext.insights
  });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 768,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Graph:\n${contextStr}\n\nExplain the connection between "${nodeA.label}" and "${nodeB.label}"`
        }
      ]
    });

    const rawContent = message.content[0].text;
    const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    let response;
    try {
      response = JSON.parse(cleaned);
    } catch (e) {
      response = { explanation: rawContent, directEvidence: [], connectionType: 'thematic', strength: 'moderate' };
    }
    return res.json(response);
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    return res.status(500).json({ error: err.message || 'Explanation failed.' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'alive', mirror: 'ready' }));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✨ THE MIRROR is running at http://localhost:${PORT}\n`);
});
