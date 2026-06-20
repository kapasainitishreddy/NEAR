import { motion } from 'framer-motion'
import { cn } from '../lib/cn.js'
import { tapLight } from '../lib/haptics.js'

// ---- Button ---------------------------------------------------------------
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none select-none'
  const variants = {
    primary:
      'bg-gradient-to-b from-gold-300 to-gold-500 text-navy-950 shadow-glow hover:from-gold-300 hover:to-gold-400',
    secondary: 'bg-white/[0.06] text-ivory-50 border border-white/[0.08] hover:bg-white/[0.1]',
    ghost: 'text-white/70 hover:text-ivory-50 hover:bg-white/[0.06]',
    danger: 'bg-red-500/15 text-red-300 border border-red-500/20 hover:bg-red-500/25',
    accent: 'bg-gradient-to-b from-lavender-400 to-lavender-500 text-navy-950 hover:from-lavender-300',
  }
  const sizes = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-3',
    lg: 'text-base px-5 py-3.5',
    icon: 'p-2.5',
  }
  return (
    <Tag className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Tag>
  )
}

// ---- Card -----------------------------------------------------------------
export function Card({ children, className = '', onClick, interactive = false }) {
  const Comp = interactive ? motion.button : motion.div
  const handleClick = interactive
    ? (e) => {
        tapLight()
        onClick?.(e)
      }
    : onClick
  return (
    <Comp
      onClick={handleClick}
      type={interactive ? 'button' : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      className={cn('card p-5 text-left w-full', interactive && 'hover:bg-white/[0.06] transition', className)}
    >
      {children}
    </Comp>
  )
}

// ---- Chip -----------------------------------------------------------------
export function Chip({ active, children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'pill border transition whitespace-nowrap',
        active
          ? 'bg-gold-400/15 border-gold-400/40 text-gold-300'
          : 'bg-white/[0.03] border-white/[0.08] text-white/55 hover:text-white/80',
        className
      )}
    >
      {children}
    </button>
  )
}

// ---- Status badge ---------------------------------------------------------
import { statusMeta } from '../lib/constants.js'
export function StatusBadge({ status }) {
  const meta = statusMeta(status)
  return <span className={cn('pill', meta.tone)}>{meta.label}</span>
}

// ---- Fields ---------------------------------------------------------------
export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && <span className="label-base">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-white/35">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={cn('input-base', className)} {...props} />
}

export function Textarea({ className = '', rows = 4, ...props }) {
  return <textarea rows={rows} className={cn('input-base resize-y leading-relaxed', className)} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={cn('input-base appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  )
}

// ---- Empty state ----------------------------------------------------------
// Pass `art` (an illustration component/node) for the premium look, or fall
// back to an `emoji`. The artwork gently floats for a touch of life.
export function EmptyState({ emoji = '✨', art, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col items-center px-6 py-10 text-center"
    >
      {art ? (
        <motion.div
          aria-hidden="true"
          className="mb-4 h-36 w-48"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {art}
        </motion.div>
      ) : (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] text-3xl">
          {emoji}
        </div>
      )}
      <h3 className="font-serif text-xl text-ivory-50">{title}</h3>
      {subtitle && <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/45">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

// ---- Safety / privacy note -----------------------------------------------
export function SafetyNote({ children, className = '' }) {
  return (
    <p className={cn('flex items-start gap-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-xs leading-relaxed text-white/45', className)}>
      <span className="mt-0.5 shrink-0 text-sm">🛟</span>
      <span>{children}</span>
    </p>
  )
}
