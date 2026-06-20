import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui.jsx'
import { CheckIcon } from './icons.jsx'
import { usePurchases } from '../context/PurchaseContext.jsx'
import { PRO_BENEFITS } from '../config.js'
import { useApp } from '../context/AppContext.jsx'

// The upgrade screen. Lists Pro benefits and the live RevenueCat packages
// (or a tasteful placeholder when billing isn't configured yet).
export default function Paywall({ open, onClose }) {
  const { configured, pro, packages, buy, restore } = usePurchases()
  const { showToast } = useApp()
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState(0)

  const onBuy = async () => {
    const pkg = packages[selected]
    if (!pkg) return
    setBusy(true)
    const res = await buy(pkg)
    setBusy(false)
    if (res.active) {
      showToast('Welcome to Receipts Pro 💜')
      onClose()
    } else if (!res.cancelled) {
      showToast('Purchase didn’t complete', 'error')
    }
  }

  const onRestore = async () => {
    setBusy(true)
    const res = await restore()
    setBusy(false)
    showToast(res.active ? 'Purchases restored' : 'Nothing to restore', res.active ? 'success' : 'error')
    if (res.active) onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative z-10 m-3 max-h-[90vh] w-full max-w-md overflow-auto rounded-3xl border border-white/10 bg-charcoal-800 p-6 shadow-soft no-scrollbar"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="pill bg-gold-400/15 text-gold-300">PRO</span>
              {pro && <span className="pill bg-emerald-500/15 text-emerald-300">Active</span>}
            </div>
            <h2 className="font-serif text-2xl text-ivory-50">Receipts Pro</h2>
            <p className="mt-1 text-sm text-white/55">
              Unlock the full toolkit. One simple upgrade — still 100% on-device and private.
            </p>

            <div className="mt-5 space-y-3">
              {PRO_BENEFITS.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-base">
                    {b.emoji}
                  </span>
                  <div>
                    <div className="font-medium text-ivory-50">{b.title}</div>
                    <div className="text-sm text-white/45">{b.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Packages */}
            <div className="mt-6 space-y-2">
              {pro ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 py-4 text-emerald-300">
                  <CheckIcon className="h-5 w-5" /> You’re all set — thank you 💜
                </div>
              ) : packages.length > 0 ? (
                <>
                  {packages.map((p, i) => (
                    <button
                      key={p.key}
                      onClick={() => setSelected(i)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        selected === i
                          ? 'border-gold-400/50 bg-gold-400/10'
                          : 'border-white/[0.08] bg-white/[0.02]'
                      }`}
                    >
                      <span className="font-medium text-ivory-50">{p.title}</span>
                      <span className="font-serif text-lg text-gold-300">{p.price}</span>
                    </button>
                  ))}
                  <Button size="lg" className="mt-2 w-full" onClick={onBuy} disabled={busy}>
                    {busy ? 'Processing…' : 'Upgrade to Pro'}
                  </Button>
                </>
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center">
                  <div className="font-serif text-xl text-ivory-50">$3.99<span className="text-sm text-white/40"> / one-time</span></div>
                  <p className="mt-1 text-xs text-white/45">
                    {configured
                      ? 'Loading plans…'
                      : 'Sample pricing. Add your RevenueCat keys in src/config.js to enable real purchases.'}
                  </p>
                  <Button size="lg" className="mt-3 w-full" disabled>
                    {configured ? 'Loading…' : 'Billing not configured'}
                  </Button>
                </div>
              )}
              {!pro && (
                <button
                  onClick={onRestore}
                  disabled={busy}
                  className="w-full py-2 text-center text-sm text-white/45 hover:text-white/70"
                >
                  Restore purchases
                </button>
              )}
            </div>

            <button onClick={onClose} className="mt-2 block w-full text-center text-sm text-white/40 hover:text-white/70">
              {pro ? 'Close' : 'Maybe later'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
