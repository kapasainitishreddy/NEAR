import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui.jsx'
import { ShareIcon, DownloadIcon } from './icons.jsx'
import { renderReceiptCard } from '../lib/receiptCard.js'
import { shareImage } from '../lib/haptics.js'
import { useApp } from '../context/AppContext.jsx'

// Generates a "torn paper receipt" image for an item and previews it with
// Share / Save actions. The image is rendered on-device via <canvas>.
export default function ShareCardModal({ open, onClose, item }) {
  const { settings, showToast } = useApp()
  const [state, setState] = useState({ loading: true, dataUrl: '', blob: null })

  useEffect(() => {
    if (!open || !item) return
    let active = true
    setState({ loading: true, dataUrl: '', blob: null })
    renderReceiptCard(item, { theme: settings?.theme })
      .then((res) => {
        if (active) setState({ loading: false, dataUrl: res.dataUrl, blob: res.blob })
      })
      .catch(() => {
        if (active) setState({ loading: false, dataUrl: '', blob: null })
        showToast('Could not create the image', 'error')
      })
    return () => {
      active = false
    }
  }, [open, item, settings?.theme, showToast])

  const filename = `${(item?.title || 'receipt').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`

  const onShare = async () => {
    const result = await shareImage({
      blob: state.blob,
      filename,
      title: item?.title || 'Receipt',
      text: 'Made with Receipts',
    })
    if (result === 'downloaded') showToast('Image saved')
    else if (result === 'failed') showToast('Could not share the image', 'error')
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
            <h3 className="mb-1 font-serif text-xl text-ivory-50">Share as a receipt</h3>
            <p className="mb-4 text-sm text-white/50">A little paper keepsake of your words.</p>

            <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
              {state.loading ? (
                <div className="flex h-72 items-center justify-center">
                  <div className="animate-shimmer rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] bg-[length:200%_100%] px-10 py-2 text-sm text-white/50">
                    Designing your receipt…
                  </div>
                </div>
              ) : state.dataUrl ? (
                <img
                  src={state.dataUrl}
                  alt="Shareable receipt preview"
                  className="block max-h-[60vh] w-full object-contain"
                />
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
            <p className="mt-3 text-center text-xs text-white/35">
              <DownloadIcon className="mr-1 inline h-3.5 w-3.5" />
              On mobile you can also long-press the image to save it.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
