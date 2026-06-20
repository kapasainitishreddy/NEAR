import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Animated SVG progress ring used to visualise a decision's "clarity score".
// The arc and the centre number both animate up on mount; colours follow the
// active theme accent (via currentColor on the gold token).
export default function ClarityRing({
  value = 0, // 0–100
  size = 76,
  stroke = 7,
  label,
  sublabel,
}) {
  const reduce = useReducedMotion()
  const gradId = useId()
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent-300))" />
              <stop offset="100%" stopColor="rgb(var(--accent-500))" />
            </linearGradient>
          </defs>
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          {/* progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: reduce ? offset : circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <CountUp value={clamped} reduce={reduce} />
        </div>
      </div>
      {(label || sublabel) && (
        <div className="min-w-0">
          {label && <div className="font-serif text-base leading-tight text-ivory-50">{label}</div>}
          {sublabel && <div className="text-xs text-white/45">{sublabel}</div>}
        </div>
      )}
    </div>
  )
}

function CountUp({ value, reduce }) {
  const [display, setDisplay] = useState(reduce ? value : 0)
  const raf = useRef(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const from = 0
    const duration = 1100
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, reduce])

  return (
    <span className="font-serif text-lg font-semibold text-ivory-50">
      {display}
      <span className="text-[10px] text-white/40">%</span>
    </span>
  )
}
