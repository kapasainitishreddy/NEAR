import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Small emotion sparkline: values in -1..1 plotted as a smooth area, centred
// on a neutral baseline. Positive = accent, drawn above the midline.
export default function SparkLine({ points = [], height = 64 }) {
  const reduce = useReducedMotion()
  const gradId = useId()
  const w = 280
  const h = height
  const pad = 8

  if (points.length < 2) {
    return (
      <div className="flex h-16 items-center justify-center text-xs text-white/35">
        Add the “feelings” field to a few decisions to see your emotional trend.
      </div>
    )
  }

  const n = points.length
  const x = (i) => pad + (i * (w - pad * 2)) / (n - 1)
  const y = (v) => h / 2 - (v * (h / 2 - pad))

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.score).toFixed(1)}`).join(' ')
  const area = `${line} L ${x(n - 1).toFixed(1)} ${h / 2} L ${x(0).toFixed(1)} ${h / 2} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent-300))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(var(--accent-300))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* neutral baseline */}
      <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke="rgba(255,255,255,0.12)" strokeDasharray="2 4" />
      <path d={area} fill={`url(#${gradId})`} />
      <motion.path
        d={line}
        fill="none"
        stroke="rgb(var(--accent-300))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={reduce ? {} : { pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {points.map((p, i) => (
        <circle
          key={p.id || i}
          cx={x(i)}
          cy={y(p.score)}
          r={2.4}
          fill={p.score >= 0 ? 'rgb(var(--accent-300))' : '#f0a4a4'}
        />
      ))}
    </svg>
  )
}
