import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { CheckIcon } from './icons.jsx'

export default function Toast() {
  const { toast } = useApp()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="pt-safe fixed inset-x-0 top-0 z-[60] flex justify-center px-4"
        >
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-charcoal-800/95 px-4 py-3 text-sm font-medium text-ivory-50 shadow-soft backdrop-blur-xl">
            <span className={toast.kind === 'error' ? 'text-red-300' : 'text-emerald-300'}>
              <CheckIcon className="h-4 w-4" />
            </span>
            {toast.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
