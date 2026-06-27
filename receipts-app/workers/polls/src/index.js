// Receipts — anonymous decision polls (Cloudflare Worker + KV).
// Endpoints:
//   POST /poll            { title, options[], pros?, cons? }  -> { id }
//   GET  /poll/:id                                            -> poll
//   POST /poll/:id/vote   { choice: number }                  -> poll (updated)
// Polls auto-expire after 60 days. Votes are anonymous; counts are best-effort
// (KV is eventually consistent — fine for a casual "what would you do?" poll).
const TTL = 60 * 60 * 24 * 60
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })
    if (!env.POLLS) return json({ error: 'KV not bound' }, 500)

    const { pathname } = new URL(request.url)
    const parts = pathname.split('/').filter(Boolean) // poll[/:id[/vote]]

    try {
      // Create
      if (request.method === 'POST' && parts[0] === 'poll' && parts.length === 1) {
        const body = await request.json()
        const options = (Array.isArray(body.options) ? body.options : [])
          .map((o) => String(o).slice(0, 120))
          .filter(Boolean)
          .slice(0, 6)
        if (options.length < 2) return json({ error: 'Need at least 2 options' }, 400)
        const id = randomId()
        const poll = {
          id,
          title: String(body.title || 'A decision').slice(0, 200),
          options,
          pros: String(body.pros || '').slice(0, 1000),
          cons: String(body.cons || '').slice(0, 1000),
          counts: options.map(() => 0),
          createdAt: Date.now(),
        }
        await env.POLLS.put('poll:' + id, JSON.stringify(poll), { expirationTtl: TTL })
        return json({ id })
      }

      // Read
      if (request.method === 'GET' && parts[0] === 'poll' && parts.length === 2) {
        const raw = await env.POLLS.get('poll:' + parts[1])
        if (!raw) return json({ error: 'Not found' }, 404)
        return json(JSON.parse(raw))
      }

      // Vote
      if (request.method === 'POST' && parts[0] === 'poll' && parts[2] === 'vote') {
        const raw = await env.POLLS.get('poll:' + parts[1])
        if (!raw) return json({ error: 'Not found' }, 404)
        const poll = JSON.parse(raw)
        const { choice } = await request.json()
        if (Number.isInteger(choice) && choice >= 0 && choice < poll.options.length) {
          poll.counts[choice] = (poll.counts[choice] || 0) + 1
          await env.POLLS.put('poll:' + parts[1], JSON.stringify(poll), { expirationTtl: TTL })
        }
        return json(poll)
      }

      return json({ error: 'Bad request' }, 400)
    } catch {
      return json({ error: 'Server error' }, 500)
    }
  },
}

function randomId() {
  return [...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(36)).join('').slice(0, 8)
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  })
}
