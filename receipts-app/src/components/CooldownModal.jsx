import { useEffect, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { Button } from './ui.jsx'

// A gentle pause before sending something written in a heated moment. Shows the
// message once more with a countdown; the action unlocks when it completes
// (with an honest "skip" for autonomy).
export default function CooldownModal({ open, onClose, text, onProceed, seconds = 20 }) {
  const [left, setLeft] = useState(seconds)
  const timer = useRef(null)

  useEffect(() => {
    if (!open) return
    setLeft(seconds)
    timer.current = setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          clearInterval(timer.current)
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(timer.current)
  }, [open, seconds])

  const ready = left <= 0
  const r = 26
  const circ = 2 * Math.PI * r
  const progress = ready ? 1 : (seconds - left) / seconds

  const proceed = () => {
    onProceed?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Take a breath first">
      <p className="text-white/55">
        You’re about to use this in a charged moment. Read it once more, slowly — does it still say what you want?
      </p>

      <div className="my-4 max-h-40 overflow-auto rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 font-serif text-[15px] leading-relaxed text-ivory-100/90 no-scrollbar">
        {text || '—'}
      </div>

      <div className="flex items-center justify-center">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="rgb(var(--accent-300))"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - progress * circ}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center font-serif text-lg text-ivory-50">
            {ready ? '✓' : left}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Not yet
        </Button>
        <Button className="flex-1" onClick={proceed} disabled={!ready}>
          {ready ? 'I’ve re-read it — copy' : 'Please wait…'}
        </Button>
      </div>
      {!ready && (
        <button onClick={proceed} className="mt-3 block w-full text-center text-xs text-white/35 hover:text-white/60">
          Skip the pause
        </button>
      )}
    </Modal>
  )
}
