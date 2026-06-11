import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { Button } from '../components/ui.jsx'
import { LockIcon, ScriptIcon, ReceiptIcon } from '../components/icons.jsx'

const SLIDES = [
  {
    emoji: '🧾',
    title: 'Receipts',
    tag: 'Save what you decided. Say what you need.',
    body: 'A calm, private space for the words you struggle to find and the choices you want to remember.',
  },
  {
    Icon: ScriptIcon,
    title: 'Calm scripts, ready when you panic',
    tag: 'Soft · Direct · Professional',
    body: 'Generate three editable versions of any hard message — apologies, boundaries, refunds, extensions and more.',
  },
  {
    Icon: ReceiptIcon,
    title: 'Decision receipts you can revisit',
    tag: 'Your reasons, on the record',
    body: 'Capture why you chose what you chose, how you felt, and what would change your mind. Future-you will thank you.',
  },
  {
    Icon: LockIcon,
    title: 'Yours, and only yours',
    tag: 'Local-first by design',
    body: 'Your scripts, decisions, notes, and reviews stay on this device. Nothing is uploaded unless you export it yourself.',
  },
]

export default function Onboarding() {
  const [index, setIndex] = useState(0)
  const { updateSettings, settings, loadDemo } = useApp()
  const navigate = useNavigate()
  const slide = SLIDES[index]
  const last = index === SLIDES.length - 1

  const finish = async (withDemo) => {
    if (withDemo && !settings.demoLoaded) await loadDemo()
    await updateSettings({ onboarded: true })
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-[88vh] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] text-6xl shadow-soft">
              {slide.emoji ? (
                <span>{slide.emoji}</span>
              ) : (
                <slide.Icon className="h-14 w-14 text-gold-300" />
              )}
            </div>
            <span className="pill mb-3 bg-lavender-500/15 text-lavender-300">{slide.tag}</span>
            <h1 className="mb-3 max-w-xs font-serif text-3xl leading-tight text-ivory-50">{slide.title}</h1>
            <p className="max-w-sm text-base leading-relaxed text-white/55">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-7 bg-gold-400' : 'w-1.5 bg-white/20'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="space-y-3">
        {!last ? (
          <>
            <Button size="lg" className="w-full" onClick={() => setIndex((i) => i + 1)}>
              Continue
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => finish(false)}>
              Skip
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" className="w-full" onClick={() => finish(true)}>
              Explore with sample data
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => finish(false)}>
              Start empty
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
