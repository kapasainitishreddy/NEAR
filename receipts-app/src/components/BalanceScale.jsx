import { motion } from 'framer-motion'

// Weighs the "pros" against the "cons" and tilts an animated scale toward the
// heavier side. Weight = number of non-empty lines, with text length as a
// tie-breaker, so the scale responds as you flesh each side out.
function weigh(text = '') {
  const lines = String(text)
    .split(/\n|·|;/)
    .map((s) => s.trim())
    .filter(Boolean)
  return lines.length + Math.min(2, String(text).trim().length / 120)
}

export default function BalanceScale({ pros = '', cons = '', className = '' }) {
  const p = weigh(pros)
  const c = weigh(cons)
  const total = p + c
  const balance = total === 0 ? 0 : (p - c) / total // -1..1, + favours pros
  const angle = Math.max(-14, Math.min(14, balance * 14))
  const verdict =
    total === 0
      ? 'Add pros and cons to weigh them'
      : Math.abs(balance) < 0.12
        ? 'Finely balanced'
        : balance > 0
          ? 'Leaning toward yes'
          : 'Leaning toward caution'

  // pan vertical offsets (heavier side dips)
  const leftDip = angle * 1.6
  const rightDip = -angle * 1.6

  return (
    <div className={className}>
      <svg viewBox="0 0 240 150" className="w-full">
        {/* stand */}
        <line x1="120" y1="26" x2="120" y2="120" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
        <path d="M96 120 h48" stroke="rgba(255,255,255,0.25)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="120" cy="26" r="5" fill="rgb(var(--accent-300))" />

        {/* beam + pans rotate together about the pivot */}
        <motion.g
          style={{ originX: '120px', originY: '26px' }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        >
          <line x1="48" y1="26" x2="192" y2="26" stroke="rgb(var(--accent-300))" strokeWidth="4" strokeLinecap="round" />
          {/* left pan (pros) */}
          <g>
            <line x1="48" y1="26" x2="48" y2={52 + leftDip} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <path
              d={`M28 ${52 + leftDip} a20 12 0 0 0 40 0 z`}
              fill="rgb(var(--accent-300) / 0.18)"
              stroke="rgb(var(--accent-300))"
              strokeWidth="2"
            />
            <text x="48" y={48 + leftDip} textAnchor="middle" fontSize="11" fill="#f5f2e9" fontWeight="600">
              Pros
            </text>
          </g>
          {/* right pan (cons) */}
          <g>
            <line x1="192" y1="26" x2="192" y2={52 + rightDip} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <path
              d={`M172 ${52 + rightDip} a20 12 0 0 0 40 0 z`}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
            <text x="192" y={48 + rightDip} textAnchor="middle" fontSize="11" fill="#f5f2e9" fontWeight="600">
              Cons
            </text>
          </g>
        </motion.g>
      </svg>
      <p className="mt-1 text-center text-sm text-white/55">{verdict}</p>
    </div>
  )
}
