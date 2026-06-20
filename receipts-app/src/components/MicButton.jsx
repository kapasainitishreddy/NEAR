import { useEffect, useRef, useState } from 'react'
import { MicIcon } from './icons.jsx'
import { tapLight } from '../lib/haptics.js'

// On-device dictation via the Web Speech API. Renders nothing if the browser
// doesn't support it. Calls onResult(finalText) as phrases are recognised.
// Speech is processed by the OS/browser; this component never uploads anything.
const SR =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export function micSupported() {
  return !!SR
}

export default function MicButton({ onResult, className = '' }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  useEffect(() => () => recRef.current?.stop?.(), [])

  if (!SR) return null

  const toggle = () => {
    tapLight()
    if (listening) {
      recRef.current?.stop?.()
      return
    }
    const rec = new SR()
    rec.lang = navigator.language || 'en-US'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript || '')
        .join(' ')
        .trim()
      if (text) onResult?.(text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? 'Stop dictation' : 'Dictate'}
      aria-pressed={listening}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition ${
        listening
          ? 'border-red-400/40 bg-red-500/15 text-red-300'
          : 'border-white/[0.08] bg-white/[0.03] text-white/55 hover:text-white/85'
      } ${className}`}
    >
      <span className="relative">
        {listening && (
          <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-red-400/30" aria-hidden="true" />
        )}
        <MicIcon className="relative h-[18px] w-[18px]" />
      </span>
    </button>
  )
}
