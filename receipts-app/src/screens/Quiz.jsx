import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card } from '../components/ui.jsx'
import { ShareIcon } from '../components/icons.jsx'
import { QUESTIONS, computeStyle, renderStyleCard } from '../lib/decisionStyle.js'
import { shareImage } from '../lib/haptics.js'

export default function Quiz() {
  const { settings, updateSettings, showToast } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [card, setCard] = useState({ loading: false, dataUrl: '', blob: null })

  const done = step >= QUESTIONS.length
  const style = useMemo(() => (done ? computeStyle(answers) : null), [done, answers])

  // Persist + render the shareable card once finished.
  useEffect(() => {
    if (!done || !style) return
    updateSettings({ decisionStyle: style.id })
    setCard({ loading: true, dataUrl: '', blob: null })
    renderStyleCard(style, { theme: settings?.theme })
      .then((r) => setCard({ loading: false, dataUrl: r.dataUrl, blob: r.blob }))
      .catch(() => setCard({ loading: false, dataUrl: '', blob: null }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const pick = (s) => {
    setAnswers((a) => [...a, s])
    setStep((i) => i + 1)
  }
  const restart = () => {
    setAnswers([])
    setStep(0)
    setCard({ loading: false, dataUrl: '', blob: null })
  }

  const onShare = async () => {
    const res = await shareImage({ blob: card.blob, filename: 'my-decision-style.png', title: 'My Decision Style' })
    if (res === 'downloaded') showToast('Saved')
    else if (res === 'failed') showToast('Could not share', 'error')
  }

  const q = QUESTIONS[step]

  return (
    <>
      <TopBar title="Decision style" subtitle="A 60-second quiz" back />

      {!done ? (
        <>
          <div className="mb-5 flex items-center gap-2">
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-gold-400' : 'bg-white/15'}`}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="mb-5 font-serif text-2xl leading-snug text-ivory-50">{q.q}</h2>
              <div className="space-y-3">
                {q.options.map((o) => (
                  <button
                    key={o.label}
                    onClick={() => pick(o.style)}
                    className="card w-full !p-4 text-left transition hover:bg-white/[0.07] active:scale-[0.99]"
                  >
                    <span className="text-[15px] text-ivory-50">{o.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-xs text-white/35">
                Question {step + 1} of {QUESTIONS.length}
              </p>
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-4 overflow-hidden !p-0">
            {card.loading ? (
              <div className="flex h-72 items-center justify-center text-sm text-white/50">Reading your answers…</div>
            ) : card.dataUrl ? (
              <img src={card.dataUrl} alt="Your decision style" className="block w-full" />
            ) : (
              <div className="p-6 text-center">
                <div className="text-5xl">{style.emoji}</div>
                <h2 className="mt-2 font-serif text-2xl text-ivory-50">{style.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{style.blurb}</p>
              </div>
            )}
          </Card>

          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {style.traits.map((t) => (
              <span key={t} className="pill bg-gold-400/15 text-gold-300">
                {t}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={onShare} disabled={!card.blob}>
              <ShareIcon className="h-4 w-4" /> Share my result
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={restart}>
                Retake
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => navigate('/home')}>
                Done
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
