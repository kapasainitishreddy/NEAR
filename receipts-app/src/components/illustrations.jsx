import { motion, useReducedMotion } from 'framer-motion'

// Hand-drawn line illustrations for empty states. Accent strokes use the
// theme accent CSS var so each illustration recolours with the active theme.
// A few elements twinkle/drift for a touch of life (disabled under reduce-motion).

const ACCENT = 'rgb(var(--accent-300))'
const ACCENT_SOFT = 'rgb(var(--accent-400))'
const LAV = '#a79ef0'
const EM = '#52c79a'
const INK = 'rgba(245,242,233,0.85)'
const INK_DIM = 'rgba(245,242,233,0.35)'

const svgProps = {
  viewBox: '0 0 220 170',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-full w-full',
}

function Twinkle({ cx, cy, r = 2.5, delay = 0, color = ACCENT }) {
  const reduce = useReducedMotion()
  if (reduce) return <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.7} />
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      initial={{ opacity: 0.25, scale: 0.7 }}
      animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
      transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

// A calm blank page greeting a sunrise — for the Home empty state.
export function CalmPageArt() {
  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.9" />
          <stop offset="100%" stopColor={ACCENT_SOFT} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="86" r="30" fill="url(#sun)" opacity="0.5" />
      <path d="M70 86a40 40 0 0 1 80 0" stroke={ACCENT} strokeWidth="2.4" />
      <line x1="58" y1="100" x2="162" y2="100" stroke={INK_DIM} strokeWidth="2" />
      {/* page */}
      <rect x="74" y="104" width="72" height="48" rx="8" fill="rgba(255,255,255,0.04)" stroke={INK} strokeWidth="2.2" />
      <line x1="86" y1="120" x2="134" y2="120" stroke={INK_DIM} strokeWidth="2.4" />
      <line x1="86" y1="130" x2="124" y2="130" stroke={INK_DIM} strokeWidth="2.4" />
      <line x1="86" y1="140" x2="118" y2="140" stroke={INK_DIM} strokeWidth="2.4" />
      <Twinkle cx={48} cy={60} delay={0} />
      <Twinkle cx={176} cy={50} r={2} delay={0.8} color={LAV} />
      <Twinkle cx={162} cy={120} r={2} delay={1.4} color={EM} />
    </svg>
  )
}

// Layered cards (a script + a receipt) — for the Library empty state.
export function EmptyLibraryArt() {
  return (
    <svg {...svgProps}>
      <rect x="58" y="58" width="78" height="64" rx="10" fill="rgba(255,255,255,0.03)" stroke={INK_DIM} strokeWidth="2" transform="rotate(-8 97 90)" />
      <rect x="76" y="50" width="82" height="68" rx="10" fill="rgba(255,255,255,0.05)" stroke={INK} strokeWidth="2.2" transform="rotate(6 117 84)" />
      {/* torn receipt accent on top card */}
      <g transform="rotate(6 117 84)">
        <line x1="90" y1="70" x2="146" y2="70" stroke={ACCENT} strokeWidth="2.6" />
        <line x1="90" y1="82" x2="138" y2="82" stroke={INK_DIM} strokeWidth="2.2" />
        <line x1="90" y1="93" x2="130" y2="93" stroke={INK_DIM} strokeWidth="2.2" />
      </g>
      <path d="M150 116l3.5 7 7.7 1-5.6 5.4 1.4 7.6-6.9-3.7-6.9 3.7 1.3-7.6-5.5-5.4 7.7-1z" fill={ACCENT} opacity="0.9" />
      <Twinkle cx={52} cy={48} delay={0.3} color={LAV} />
      <Twinkle cx={172} cy={64} r={2} delay={1.1} />
    </svg>
  )
}

// Magnifying glass over scattered dots — for "no matches".
export function SearchArt() {
  return (
    <svg {...svgProps}>
      <circle cx="100" cy="80" r="34" fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth="2.6" />
      <circle cx="100" cy="80" r="22" stroke={INK_DIM} strokeWidth="2" strokeDasharray="3 6" />
      <line x1="126" y1="106" x2="150" y2="130" stroke={ACCENT} strokeWidth="4" />
      <Twinkle cx={64} cy={50} delay={0.2} />
      <Twinkle cx={150} cy={56} r={2} delay={0.9} color={LAV} />
      <Twinkle cx={70} cy={120} r={2} delay={1.5} color={EM} />
    </svg>
  )
}

// A compass — for the Rules empty state ("set your direction in advance").
export function CompassArt() {
  return (
    <svg {...svgProps}>
      <circle cx="110" cy="85" r="40" fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth="2.4" />
      <circle cx="110" cy="85" r="48" stroke={INK_DIM} strokeWidth="1.6" strokeDasharray="2 8" />
      <path d="M110 56l10 26-26 10z" fill={ACCENT} opacity="0.95" />
      <path d="M110 114l-10-26 26-10z" fill={LAV} opacity="0.55" />
      <circle cx="110" cy="85" r="4" fill={INK} />
      <Twinkle cx={58} cy={56} delay={0.4} />
      <Twinkle cx={166} cy={108} r={2} delay={1.2} color={EM} />
    </svg>
  )
}
