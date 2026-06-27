// Client for the anonymous friend-polls Worker. Gracefully unavailable until
// SOCIAL.pollsEndpoint is configured.
import { SOCIAL, isPollsConfigured } from '../config.js'

export { isPollsConfigured }

const base = () => SOCIAL.pollsEndpoint.replace(/\/$/, '')

// Public link a friend can open to vote (resolves against the hosted web app).
export function pollLink(id) {
  const root = (SOCIAL.webBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')
  return `${root}/#/poll/${id}`
}

// Derive 2–6 options from a decision's "options considered" field.
export function optionsFromDecision(d = {}) {
  const raw = String(d.optionsConsidered || '')
    .split(/\n|·|;|,| or /i)
    .map((s) => s.trim())
    .filter(Boolean)
  if (raw.length >= 2) return raw.slice(0, 6)
  return ['Yes — go for it', 'No — hold off']
}

export async function createPoll(decision) {
  if (!isPollsConfigured()) throw new Error('Polls not configured')
  const res = await fetch(`${base()}/poll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: decision.title || 'A decision',
      options: optionsFromDecision(decision),
      pros: decision.pros || '',
      cons: decision.cons || '',
    }),
  })
  if (!res.ok) throw new Error('Could not create poll')
  return res.json() // { id }
}

export async function getPoll(id) {
  if (!isPollsConfigured()) throw new Error('Polls not configured')
  const res = await fetch(`${base()}/poll/${id}`)
  if (!res.ok) throw new Error('Poll not found')
  return res.json()
}

export async function votePoll(id, choice) {
  if (!isPollsConfigured()) throw new Error('Polls not configured')
  const res = await fetch(`${base()}/poll/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice }),
  })
  if (!res.ok) throw new Error('Could not vote')
  return res.json()
}
