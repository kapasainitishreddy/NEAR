import { useEffect, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { Button, Textarea } from './ui.jsx'
import MicButton, { micSupported } from './MicButton.jsx'
import { SpeakerIcon } from './icons.jsx'
import { speak, stopSpeaking, speechSupported } from '../lib/speech.js'
import { useApp } from '../context/AppContext.jsx'

// A guided, hands-free reflection: the app speaks each question aloud and you
// answer by voice (or type). At the end it fills the decision receipt for you.
const STEPS = [
  { key: 'title', q: 'What decision are you making?', hint: 'e.g. Should I take the job in Lisbon?' },
  { key: 'finalDecision', q: 'What are you leaning toward right now?', hint: 'Say it out loud.' },
  { key: 'mainReason', q: 'What’s the single biggest reason?', hint: 'The one that matters most.' },
  { key: 'pros', q: 'What makes this a good choice?', hint: 'The upsides.' },
  { key: 'cons', q: 'What are the downsides you’d accept?', hint: 'Be honest.' },
  { key: 'feelings', q: 'How are you feeling about it, honestly?', hint: 'Name it — no judgement.' },
  { key: 'futureMeNote', q: 'What do you want future-you to remember about this moment?', hint: '' },
]

export default function TalkItOut({ open, onClose, onApply }) {
  const { settings } = useApp()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [muted, setMuted] = useState(false)
  const startedRef = useRef(false)

  const current = STEPS[step]
  const canSpeak = speechSupported()

  // Reset when opened.
  useEffect(() => {
    if (open) {
      setStep(0)
      setAnswers({})
      startedRef.current = false
    } else {
      stopSpeaking()
    }
  }, [open])

  // Speak the current question whenever the step changes.
  useEffect(() => {
    if (!open || muted || !canSpeak) return
    const t = setTimeout(() => {
      speak(current.q, { voiceURI: settings.speechVoice, rate: settings.speechRate || 1 })
    }, 250)
    return () => {
      clearTimeout(t)
      stopSpeaking()
    }
  }, [open, step, muted]) // eslint-disable-line react-hooks/exhaustive-deps

  const setAnswer = (v) => setAnswers((a) => ({ ...a, [current.key]: v }))
  const appendVoice = (t) =>
    setAnswers((a) => ({ ...a, [current.key]: a[current.key] ? `${a[current.key]} ${t}` : t }))

  const next = () => {
    stopSpeaking()
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }
  const back = () => {
    stopSpeaking()
    setStep((s) => Math.max(0, s - 1))
  }
  const finish = () => {
    const cleaned = Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [k, (v || '').trim()]).filter(([, v]) => v)
    )
    onApply(cleaned)
    onClose()
  }

  const replay = () =>
    speak(current.q, { voiceURI: settings.speechVoice, rate: settings.speechRate || 1 })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🎙️ Talk it out"
      footer={
        <>
          {step > 0 ? (
            <Button variant="secondary" className="flex-1" onClick={back}>
              Back
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button className="flex-1" onClick={next}>
            {step < STEPS.length - 1 ? 'Next' : 'Build my receipt'}
          </Button>
        </>
      }
    >
      {/* progress */}
      <div className="mb-4 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-gold-400' : 'bg-white/15'
            }`}
          />
        ))}
      </div>

      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-serif text-xl leading-snug text-ivory-50">{current.q}</h3>
        {canSpeak && (
          <button
            onClick={replay}
            className="mt-1 shrink-0 text-white/45 hover:text-gold-300"
            aria-label="Replay question"
          >
            <SpeakerIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {current.hint && <p className="mb-3 text-sm text-white/45">{current.hint}</p>}

      <div className="flex items-start gap-2">
        <Textarea
          rows={3}
          autoFocus
          placeholder={micSupported() ? 'Speak or type your answer…' : 'Type your answer…'}
          value={answers[current.key] || ''}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <MicButton onResult={appendVoice} className="mt-1" />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        {canSpeak && (
          <button onClick={() => setMuted((m) => !m)} className="hover:text-white/70">
            {muted ? '🔇 Voice off' : '🔊 Voice on'}
          </button>
        )}
      </div>
    </Modal>
  )
}
