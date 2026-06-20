import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

// Surfaces a relevant personal rule at the moment of writing — turning the
// Rules list into an active conscience. Relevance is a simple keyword overlap
// with the current context; falls back to a stable pick.
function relevantRule(rules, context) {
  if (!rules?.length) return null
  const ctx = String(context || '').toLowerCase()
  const words = new Set(ctx.match(/[a-z]{4,}/g) || [])
  let best = null
  let bestScore = -1
  rules.forEach((r, i) => {
    const text = `${r.text} ${r.note || ''}`.toLowerCase()
    const hits = (text.match(/[a-z]{4,}/g) || []).filter((w) => words.has(w)).length
    // tiny deterministic tiebreaker so it doesn't reshuffle every keystroke
    const score = hits * 10 + ((i * 7) % 5)
    if (score > bestScore) {
      bestScore = score
      best = r
    }
  })
  return best
}

export default function RuleNudge({ rules, context, className = '' }) {
  const [dismissed, setDismissed] = useState(false)
  const rule = useMemo(() => relevantRule(rules, context), [rules, context])

  if (!rule || dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 rounded-2xl border border-gold-400/25 bg-gold-400/[0.08] p-4 ${className}`}
    >
      <span className="mt-0.5 text-lg">🧭</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-gold-300">Your rule</div>
        <p className="mt-0.5 font-serif text-base leading-snug text-ivory-50">{rule.text}</p>
        {rule.note && <p className="mt-0.5 text-xs text-white/45">{rule.note}</p>}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-white/30 hover:text-white/60"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}
