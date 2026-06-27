// Receipts — AI Co-pilot proxy (Cloudflare Worker).
// Keeps your Anthropic key server-side. The app POSTs { prompt, system, model }
// and gets back { text }. Set ANTHROPIC_API_KEY as a secret; optionally set
// ALLOWED_ORIGIN to lock CORS to your app's origin.
const DEFAULT_MODEL = 'claude-haiku-4-5'

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env)
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: cors })
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Server not configured' }, 500, cors)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON' }, 400, cors)
    }

    const prompt = String(body.prompt || '').slice(0, 8000)
    if (!prompt) return json({ error: 'Missing prompt' }, 400, cors)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: body.model || env.MODEL || DEFAULT_MODEL,
          max_tokens: 1024,
          system: body.system || 'You are a calm, kind assistant. Never give legal, medical, or financial advice.',
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        return json({ error: data?.error?.message || 'Upstream error' }, 502, cors)
      }
      const text = data?.content?.map((b) => b.text).join('') || ''
      return json({ text }, 200, cors)
    } catch {
      return json({ error: 'Request failed' }, 502, cors)
    }
  },
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  })
}
