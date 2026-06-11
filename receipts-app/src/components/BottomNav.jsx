import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '../lib/cn.js'
import { HomeIcon, ScriptIcon, ReceiptIcon, LibraryIcon, RulesIcon } from './icons.jsx'

const TABS = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/script', label: 'Script', Icon: ScriptIcon },
  { to: '/receipt', label: 'Receipt', Icon: ReceiptIcon },
  { to: '/library', label: 'Library', Icon: LibraryIcon },
  { to: '/rules', label: 'Rules', Icon: RulesIcon },
]

export default function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-safe">
      <div className="pointer-events-auto mx-3 mb-2 flex w-full max-w-md items-center justify-between gap-1 rounded-3xl border border-white/[0.08] bg-charcoal-900/80 p-1.5 shadow-soft backdrop-blur-2xl">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className="relative flex-1">
            {({ isActive }) => (
              <div
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-2xl py-2 transition',
                  isActive ? 'text-gold-300' : 'text-white/45 hover:text-white/70'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 rounded-2xl bg-gold-400/10 border border-gold-400/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-[22px] w-[22px]" />
                <span className="relative z-10 text-[10px] font-medium tracking-wide">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
