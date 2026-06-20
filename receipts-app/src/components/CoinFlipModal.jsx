import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Input } from './ui.jsx'
import { tapLight, tapSuccess } from '../lib/haptics.js'

// A coin flip for trivial choices — but the twist is the gut-reaction step:
// the flip doesn't decide, your reaction to it reveals what you actually wanted.
export default function CoinFlipModal({ open, onClose }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [phase, setPhase] = useState('setup') // setup | flipping | result | reflect | done
  const [result, setResult] = useState(null) // 'a' | 'b'
  const [gut, setGut] = useState(null)

  const reset = () => {
    setA('')
    setB('')
    setPhase('setup')
    setResult(null)
    setGut(null)
  }
  const close = () => {
    onClose()
    setTimeout(reset, 300)
  }

  const flip = () => {
    setPhase('flipping')
    tapLight()
    const landed = Math.random() < 0.5 ? 'a' : 'b'
    setTimeout(() => {
      setResult(landed)
      setPhase('result')
      tapSuccess()
    }, 1400)
  }

  const labelFor = (id) => (id === 'a' ? a || 'Option A' : b || 'Option B')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-navy-950/75 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative z-10 m-3 w-full max-w-sm rounded-3xl border border-white/10 bg-charcoal-800 p-5 shadow-soft"
          >
            <h3 className="mb-1 font-serif text-xl text-ivory-50">Flip for it</h3>
            <p className="mb-4 text-sm text-white/50">
              For small choices. The coin won’t decide — your gut reaction will.
            </p>

            {phase === 'setup' && (
              <div className="space-y-3">
                <Input placeholder="Heads — e.g. stay in" value={a} onChange={(e) => setA(e.target.value)} />
                <Input placeholder="Tails — e.g. go out" value={b} onChange={(e) => setB(e.target.value)} />
                <Button className="w-full" onClick={flip} disabled={!a.trim() || !b.trim()}>
                  Flip the coin
                </Button>
              </div>
            )}

            {(phase === 'flipping' || phase === 'result' || phase === 'reflect' || phase === 'done') && (
              <div className="flex flex-col items-center">
                <motion.div
                  className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-b from-gold-300 to-gold-500 text-3xl font-bold text-navy-950 shadow-glow"
                  animate={
                    phase === 'flipping'
                      ? { rotateX: [0, 1800], scale: [1, 1.1, 1] }
                      : { rotateX: 0 }
                  }
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {phase === 'flipping' ? '✦' : result === 'a' ? 'H' : 'T'}
                </motion.div>

                {phase === 'result' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 w-full text-center"
                  >
                    <div className="text-sm text-white/50">The coin says</div>
                    <div className="font-serif text-2xl text-ivory-50">{labelFor(result)}</div>
                    <p className="mt-3 text-sm text-white/55">Quick — how do you feel about that?</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setGut('relieved')
                          setPhase('reflect')
                        }}
                      >
                        😌 Relieved
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setGut('disappointed')
                          setPhase('reflect')
                        }}
                      >
                        😞 Disappointed
                      </Button>
                    </div>
                  </motion.div>
                )}

                {phase === 'reflect' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 w-full rounded-2xl bg-white/[0.03] p-4 text-center"
                  >
                    <p className="text-sm leading-relaxed text-ivory-100/90">
                      {gut === 'relieved' ? (
                        <>
                          Your relief is the answer — you wanted{' '}
                          <span className="font-semibold text-gold-300">{labelFor(result)}</span> all along.
                        </>
                      ) : (
                        <>
                          That flash of disappointment means you’d rather have{' '}
                          <span className="font-semibold text-gold-300">{labelFor(result === 'a' ? 'b' : 'a')}</span>.
                          Trust it.
                        </>
                      )}
                    </p>
                    <Button className="mt-4 w-full" onClick={close}>
                      Got my answer
                    </Button>
                    <button onClick={() => { setPhase('setup'); setResult(null); setGut(null) }} className="mt-2 text-xs text-white/45 hover:text-white/70">
                      Flip again
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {phase === 'setup' && (
              <button onClick={close} className="mt-4 w-full text-center text-xs text-white/45 hover:text-white/70">
                Cancel
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
