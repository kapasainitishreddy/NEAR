// Optional AI Co-pilot. Talks to YOUR proxy endpoint (configured in src/config.js)
// so no provider key ever lives in the client. Disabled cleanly when unconfigured.
import { AI, isAiConfigured } from '../config.js'

export { isAiConfigured }

export async function aiComplete(prompt, { system } = {}) {
  if (!isAiConfigured()) throw new Error('AI not configured')
  const res = await fetch(AI.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system, model: AI.model }),
  })
  if (!res.ok) throw new Error(`AI request failed (${res.status})`)
  const data = await res.json().catch(() => ({}))
  return (
    data.text ||
    data.completion ||
    data.choices?.[0]?.message?.content ||
    data.content?.[0]?.text ||
    ''
  ).trim()
}

export function improveScript(text, tone = 'clear and kind') {
  return aiComplete(
    `Rewrite the following message so it is ${tone}, while keeping the sender's authentic voice and intent. Return ONLY the rewritten message, no preamble.\n\n"""${text}"""`,
    { system: 'You help people communicate calmly, honestly, and kindly. Never add legal, medical, or financial advice.' }
  )
}

export function challengeDecision(d = {}) {
  const ctx = [
    d.title && `Decision: ${d.title}`,
    d.finalDecision && `Leaning toward: ${d.finalDecision}`,
    d.mainReason && `Main reason: ${d.mainReason}`,
  ]
    .filter(Boolean)
    .join('\n')
  return aiComplete(
    `Here is a decision someone is weighing:\n${ctx}\n\nGive 3 short, sharp counter-questions that pressure-test their thinking. Return as plain lines starting with "• ". No preamble.`,
    { system: "You are a thoughtful devil's advocate who asks better questions rather than giving answers." }
  )
}
