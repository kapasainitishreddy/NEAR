import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui.jsx'
import { ShareIcon } from './icons.jsx'
import { useApp } from '../context/AppContext.jsx'
import { computeWrapped, renderWrapped } from '../lib/wrapped.js'
import { shareImage } from '../lib/haptics.js'

// "Decision Wrapped" — a shareable year-in-review poster.
export default function WrappedModal({ open, onClose }) {
  const { scripts, decisions, rules, settings, showToast } = useApp()
  const [state, setState] = useState({ loading: true, dataUrl: '', blob: null })

  const stats = useMemo(
    () => computeWrapped({ scripts, decisions, rules }),
    [scripts, decisions, rules]
  )

  useEffect(() => {
    if (!open) return
    let active = true
    setState({ loading: true, dataUrl: '', blob: null })
    renderWrapped(stats, { theme: settings?.theme })
      .then((res) => active && setState({ loading: false, dataUrl: res.dataUrl, blob: res.blob }))
      .catch(() => {
        if (active) setState({ loading: false, dataUrl: '', blob: null })
        showToast('Could not create your Wrapped', 'error')
      })
    return () => {
      active = false
    }
  }, [open, stats, settings?.theme, showToast])

  const onShare = async () => {
    const result = await shareImage({
      blob: state.blob,
      filename: 'decision-wrapped.png',
      title: 'My Decision Wrapped',
    })
    if (result === 'downloaded') showToast('Saved')
    else if (result === 'failed') showToast('Could not share', 'error')
    else onClose()
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
          <div className="absolute inset-0 bg-navy-950/75 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative z-10 m-3 w-full max-w-sm rounded-3xl border border-white/10 bg-charcoal-800 p-5 shadow-soft"
          >
            <h3 className="mb-1 font-serif text-xl text-ivory-50">Your Decision Wrapped</h3>
            <p className="mb-4 text-sm text-white/50">Your year of decisions, on one shareable card.</p>

            <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
              {state.loading ? (
                <div className="flex h-80 items-center justify-center text-sm text-white/50">
                  Wrapping up your year…
                </div>
              ) : state.dataUrl ? (
                <img src={state.dataUrl} alt="Decision Wrapped" className="block w-full" />
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-white/40">
                  Couldn’t render the image.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button className="flex-1" onClick={onShare} disabled={!state.blob}>
                <ShareIcon className="h-4 w-4" /> Share
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
