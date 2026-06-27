import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// A calm focus space: a breathing guide plus gentle ambient sound, synthesized
// on-device with the Web Audio API (no audio files, no network).
function createAmbience() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  const ctx = new Ctx()

  // Pink-noise buffer (Paul Kellet's refined method), looped.
  const len = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04
    b6 = white * 0.115926
  }

  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600

  // Slow LFO sweeps the filter for a soft, breathing "ocean" movement.
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 220
  lfo.connect(lfoGain).connect(filter.frequency)

  const gain = ctx.createGain()
  gain.gain.value = 0
  src.connect(filter).connect(gain).connect(ctx.destination)

  src.start()
  lfo.start()
  gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2)

  return {
    stop() {
      try {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
        setTimeout(() => ctx.close(), 700)
      } catch {
        /* ignore */
      }
    },
  }
}

export default function FocusMode({ open, onClose }) {
  const [running, setRunning] = useState(false)
  const [muted, setMuted] = useState(false)
  const ambienceRef = useRef(null)

  const stopAudio = () => {
    ambienceRef.current?.stop?.()
    ambienceRef.current = null
  }

  useEffect(() => {
    if (!open) {
      stopAudio()
      setRunning(false)
    }
    return stopAudio
  }, [open])

  const begin = () => {
    setRunning(true)
    if (!muted) ambienceRef.current = createAmbience()
  }
  const toggleMute = () => {
    setMuted((m) => {
      const next = !m
      if (next) stopAudio()
      else if (running) ambienceRef.current = createAmbience()
      return next
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ambient gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lavender-500/10 via-transparent to-gold-500/10" />

          <button
            onClick={onClose}
            className="absolute right-5 top-6 text-white/40 hover:text-white/80"
            aria-label="Close focus mode"
          >
            ✕
          </button>

          {!running ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 px-8 text-center"
            >
              <div className="mb-4 text-5xl">🌙</div>
              <h2 className="mb-2 font-serif text-2xl text-ivory-50">Take a breath</h2>
              <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-white/55">
                A minute of calm before a hard decision. Follow the circle — in as it grows, out as it shrinks.
              </p>
              <button
                onClick={begin}
                className="rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-8 py-3 font-semibold text-navy-950 shadow-glow"
              >
                Begin
              </button>
            </motion.div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                className="grid h-56 w-56 place-items-center rounded-full bg-gradient-to-b from-lavender-400/30 to-lavender-500/5"
                animate={{ scale: [1, 1.35, 1.35, 1], opacity: [0.7, 1, 1, 0.7] }}
                transition={{ duration: 9.5, times: [0, 0.42, 0.58, 1], repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.span
                  className="font-serif text-xl text-ivory-50"
                  animate={{ opacity: [1, 1, 1, 1] }}
                >
                  <Breath />
                </motion.span>
              </motion.div>
              <button onClick={toggleMute} className="mt-10 text-sm text-white/50 hover:text-white/80">
                {muted ? '🔇 Sound off' : '🔊 Sound on'}
              </button>
              <button onClick={onClose} className="mt-3 text-xs text-white/35 hover:text-white/60">
                I’m ready
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Cycles the breathing cue text in time with the circle.
function Breath() {
  const [phase, setPhase] = useState('Breathe in')
  useEffect(() => {
    const seq = [
      ['Breathe in', 0],
      ['Hold', 4000],
      ['Breathe out', 5500],
    ]
    const timers = seq.map(([label, t]) => setTimeout(() => setPhase(label), t))
    const loop = setInterval(() => {
      setPhase('Breathe in')
      setTimeout(() => setPhase('Hold'), 4000)
      setTimeout(() => setPhase('Breathe out'), 5500)
    }, 9500)
    return () => {
      timers.forEach(clearTimeout)
      clearInterval(loop)
    }
  }, [])
  return phase
}
