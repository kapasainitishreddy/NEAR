import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar.jsx'
import { Button, Card } from '../components/ui.jsx'
import { getPoll, votePoll, isPollsConfigured } from '../lib/polls.js'

// Public, no-account page where a friend can weigh in on a shared decision.
export default function Poll() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [state, setState] = useState('loading') // loading | ready | voted | error
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isPollsConfigured()) {
      setState('error')
      return
    }
    let active = true
    getPoll(id)
      .then((p) => active && (setPoll(p), setState(localStorage.getItem('voted:' + id) ? 'voted' : 'ready')))
      .catch(() => active && setState('error'))
    return () => {
      active = false
    }
  }, [id])

  const cast = async (choice) => {
    setBusy(true)
    try {
      const updated = await votePoll(id, choice)
      localStorage.setItem('voted:' + id, '1')
      setPoll(updated)
      setState('voted')
    } catch {
      setState('error')
    } finally {
      setBusy(false)
    }
  }

  const total = poll ? poll.counts.reduce((a, b) => a + b, 0) : 0

  return (
    <>
      <TopBar title="What would you do?" subtitle="An anonymous decision poll" />

      {state === 'loading' && <Card><p className="text-white/55">Loading…</p></Card>}

      {state === 'error' && (
        <Card>
          <p className="text-white/55">
            This poll isn’t available. {!isPollsConfigured() && 'Polls need to be configured by the app owner.'}
          </p>
          <Button className="mt-4" onClick={() => navigate('/home')}>
            Open Receipts
          </Button>
        </Card>
      )}

      {(state === 'ready' || state === 'voted') && poll && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-4">
            <h2 className="font-serif text-xl text-ivory-50">{poll.title}</h2>
            {(poll.pros || poll.cons) && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {poll.pros && (
                  <div>
                    <div className="label-base">Pros</div>
                    <p className="whitespace-pre-wrap text-white/70">{poll.pros}</p>
                  </div>
                )}
                {poll.cons && (
                  <div>
                    <div className="label-base">Cons</div>
                    <p className="whitespace-pre-wrap text-white/70">{poll.cons}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="space-y-3">
            {poll.options.map((opt, i) => {
              const count = poll.counts[i] || 0
              const pct = total ? Math.round((count / total) * 100) : 0
              return state === 'voted' ? (
                <div key={i} className="card !p-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ivory-50">{opt}</span>
                    <span className="text-white/45">{pct}% · {count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  key={i}
                  disabled={busy}
                  onClick={() => cast(i)}
                  className="card w-full !p-4 text-left transition hover:bg-white/[0.07] active:scale-[0.99]"
                >
                  <span className="text-[15px] text-ivory-50">{opt}</span>
                </button>
              )
            })}
          </div>

          <p className="mt-4 text-center text-xs text-white/40">
            {state === 'voted' ? `Thanks for weighing in · ${total} vote${total === 1 ? '' : 's'}` : 'Tap the option you’d choose'}
          </p>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/home')}>
            Make your own decisions with Receipts →
          </Button>
        </motion.div>
      )}
    </>
  )
}
