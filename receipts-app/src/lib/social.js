// Builders for shareable text used by the social/growth features. These use the
// native share sheet (no backend). Aggregated polling / Pro gifting redemption
// would each need a server + RevenueCat offer codes — see the in-app notes.

export function adviceText(d = {}) {
  const lines = [`I’m trying to decide: ${d.title || 'something'}`]
  if (d.optionsConsidered) lines.push(`Options I’m weighing:\n${d.optionsConsidered}`)
  if (d.pros) lines.push(`Pros:\n${d.pros}`)
  if (d.cons) lines.push(`Cons:\n${d.cons}`)
  lines.push('What would you do? 🤔')
  return lines.join('\n\n')
}

export function accountabilityText(d = {}) {
  const when = d.reviewDate ? new Date(d.reviewDate).toLocaleDateString() : 'soon'
  return `Keeping myself honest: I’m deciding “${d.title || 'this'}.” I’ll review how it turned out on ${when}. Mind checking in on me then? 🤝`
}

export function inviteText() {
  return `I’ve been using Receipts to think through decisions and find the words for hard messages — calm, private, and no account needed. Thought you’d like it. 🧾`
}
