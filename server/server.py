"""
THE MIRROR — Simple Python Backend Server
Use this if Node.js is not available.
Requires: pip install anthropic flask flask-cors

Usage:
  1. Set your API key:  set ANTHROPIC_API_KEY=sk-ant-...
  2. Run:              python server.py
  3. Open:            http://localhost:3001
"""

import os
import json
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import anthropic

app = Flask(__name__, static_folder='../public', static_url_path='')
CORS(app)

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', ''))

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')

def clean_json(raw: str) -> dict:
    cleaned = re.sub(r'^```json\s*', '', raw, flags=re.IGNORECASE)
    cleaned = re.sub(r'^```\s*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    return json.loads(cleaned.strip())


EXTRACT_SYSTEM = """You are the cognitive engine of THE MIRROR — an AI that transforms a person's unstructured thoughts into a structured intellectual map.
YOU MUST RESPOND WITH VALID JSON ONLY. No prose. No markdown fences. Just raw JSON.
Extract 15-30 meaningful concepts, 4-7 clusters, 20-40 edges, and rich insights.
REQUIRED JSON STRUCTURE: {"nodes":[{"id","label","cluster","weight","mentions","status","firstSeen","lastSeen","sourceExcerpts":[],"aiInterpretation"}],"edges":[{"id","source","target","strength","type","label","evidence"}],"clusters":[{"id","label","theme","colorKey"}],"insights":{"recurring":[],"abandoned":[],"emerging":[],"hiddenConnections":[],"evolution":[],"dominantTheme","mirrorObservation"},"metadata":{"totalThoughts","dateRange","conceptCount","clusterCount","dominantClusters":[]}}"""

ASK_SYSTEM = """You are THE MIRROR. Answer questions about a user's thought landscape using ONLY evidence from the provided graph.
RESPOND WITH VALID JSON ONLY: {"answer":"answer","supportingNodes":["id"],"evidence":["quote"],"type":"observation|pattern|connection|question|evolution"}"""

EXPLAIN_SYSTEM = """You are THE MIRROR. Explain why two concepts are connected.
RESPOND WITH VALID JSON ONLY: {"explanation":"why","directEvidence":["quote"],"connectionType":"direct|thematic|emotional|temporal|causal","strength":"strong|moderate|subtle"}"""


@app.route('/api/health')
def health():
    return jsonify({'status': 'alive', 'mirror': 'ready'})


@app.route('/api/extract', methods=['POST'])
def extract():
    text = request.json.get('text', '')
    if len(text.strip()) < 10:
        return jsonify({'error': 'Too short'}), 400
    try:
        msg = client.messages.create(
            model='claude-sonnet-4-5',
            max_tokens=8192,
            system=EXTRACT_SYSTEM,
            messages=[{'role': 'user', 'content': f'Analyze these thoughts:\n\n{text}'}]
        )
        return jsonify(clean_json(msg.content[0].text))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get('question', '')
    graph = data.get('graphContext', {})
    ctx = json.dumps({'nodes': graph.get('nodes', [])[:30], 'edges': graph.get('edges', [])[:40],
                      'clusters': graph.get('clusters'), 'insights': graph.get('insights')})
    try:
        msg = client.messages.create(
            model='claude-sonnet-4-5',
            max_tokens=1024,
            system=ASK_SYSTEM,
            messages=[{'role': 'user', 'content': f'Graph:\n{ctx}\n\nQuestion: {question}'}]
        )
        return jsonify(clean_json(msg.content[0].text))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain', methods=['POST'])
def explain():
    data = request.json
    node_a = data.get('nodeA', {})
    node_b = data.get('nodeB', {})
    graph = data.get('graphContext', {})
    edges = [e for e in graph.get('edges', [])
             if e.get('source') in [node_a.get('id'), node_b.get('id')]
             or e.get('target') in [node_a.get('id'), node_b.get('id')]]
    ctx = json.dumps({'nodes': graph.get('nodes', []), 'edges': edges})
    try:
        msg = client.messages.create(
            model='claude-sonnet-4-5',
            max_tokens=768,
            system=EXPLAIN_SYSTEM,
            messages=[{'role': 'user', 'content': f'Graph:\n{ctx}\n\nExplain: "{node_a.get("label")}" ↔ "{node_b.get("label")}"'}]
        )
        return jsonify(clean_json(msg.content[0].text))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(PUBLIC_DIR, path)):
        return send_from_directory(PUBLIC_DIR, path)
    return send_from_directory(PUBLIC_DIR, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    print(f'\n*** THE MIRROR (Python) running at http://localhost:{port}\n')
    app.run(port=port, debug=False)
