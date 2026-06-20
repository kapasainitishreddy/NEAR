import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { CheckIcon, AlertIcon } from './icons.jsx'

export default function Toast() {
  const { toast } = useApp()
  const isError = toast?.kind === 'error'

  return (
    // aria-live region so assistive tech announces feedback even after the
    // visual toast fades. Polite for success, assertive for errors.
    <div
      role="status"
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="pointer-events-none"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pt-safe fixed inset-x-0 top-0 z-[60] flex justify-center px-4"
          >
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-charcoal-800/95 px-4 py-3 text-sm font-medium text-ivory-50 shadow-soft backdrop-blur-xl">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full ${
                  isError ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {isError ? <AlertIcon className="h-3.5 w-3.5" /> : <CheckIcon className="h-3.5 w-3.5" />}
              </span>
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
