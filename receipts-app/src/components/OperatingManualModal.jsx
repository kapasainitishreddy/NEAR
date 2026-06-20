import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui.jsx'
import { ShareIcon } from './icons.jsx'
import { renderManual } from '../lib/operatingManual.js'
import { clarityScore } from '../lib/clarity.js'
import { shareImage } from '../lib/haptics.js'
import { useApp } from '../context/AppContext.jsx'

// Compiles rules + guiding principles into a shareable poster image.
export default function OperatingManualModal({ open, onClose }) {
  const { rules, decisions, settings, showToast } = useApp()
  const [state, setState] = useState({ loading: true, dataUrl: '', blob: null })

  const principles = useMemo(() => {
    const ranked = decisions
      .slice()
      .sort((a, b) => (b.favorite === a.favorite ? clarityScore(b).pct - clarityScore(a).pct : b.favorite ? 1 : -1))
    return ranked
      .map((d) => (d.mainReason || '').trim())
      .filter(Boolean)
      .slice(0, 4)
  }, [decisions])

  useEffect(() => {
    if (!open) return
    let active = true
    setState({ loading: true, dataUrl: '', blob: null })
    renderManual(
      { name: settings?.name?.trim(), rules: rules.slice(0, 12), principles },
      { theme: settings?.theme }
    )
      .then((res) => active && setState({ loading: false, dataUrl: res.dataUrl, blob: res.blob }))
      .catch(() => {
        if (active) setState({ loading: false, dataUrl: '', blob: null })
        showToast('Could not create the manual', 'error')
      })
    return () => {
      active = false
    }
  }, [open, rules, principles, settings?.name, settings?.theme, showToast])

  const onShare = async () => {
    const result = await shareImage({
      blob: state.blob,
      filename: 'personal-operating-manual.png',
      title: 'My Personal Operating Manual',
    })
    if (result === 'downloaded') showToast('Manual saved')
    else if (result === 'failed') showToast('Could not share', 'error')
    else onClose()
  }

  const empty = rules.length === 0 && principles.length === 0

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
            <h3 className="mb-1 font-serif text-xl text-ivory-50">Personal Operating Manual</h3>
            <p className="mb-4 text-sm text-white/50">Your rules and principles, on one beautiful page.</p>

            {empty ? (
              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/50">
                Add a few personal rules (and decisions with a “main reason”) to compose your manual.
              </div>
            ) : (
              <div className="mb-5 max-h-[60vh] overflow-auto rounded-2xl border border-white/10 bg-navy-950 no-scrollbar">
                {state.loading ? (
                  <div className="flex h-72 items-center justify-center text-sm text-white/50">
                    Typesetting your manual…
                  </div>
                ) : state.dataUrl ? (
                  <img src={state.dataUrl} alt="Operating manual preview" className="block w-full" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-white/40">
                    Couldn’t render the image.
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button className="flex-1" onClick={onShare} disabled={!state.blob || empty}>
                <ShareIcon className="h-4 w-4" /> Share
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
