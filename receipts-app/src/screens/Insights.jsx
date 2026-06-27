import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Card, EmptyState, SafetyNote } from '../components/ui.jsx'
import ClarityRing from '../components/ClarityRing.jsx'
import SparkLine from '../components/SparkLine.jsx'
import WrappedModal from '../components/WrappedModal.jsx'
import { SearchArt } from '../components/illustrations.jsx'
import { calibration, patterns, emotionSeries } from '../lib/insights.js'
import { badges, computeStreak } from '../lib/gamification.js'

export default function Insights() {
  const { scripts, decisions, rules } = useApp()
  const navigate = useNavigate()

  const cal = useMemo(() => calibration(decisions), [decisions])
  const tells = useMemo(() => patterns(decisions), [decisions])
  const emotions = useMemo(() => emotionSeries(decisions), [decisions])
  const earned = useMemo(() => badges({ scripts, decisions, rules }), [scripts, decisions, rules])
  const streak = useMemo(() => computeStreak([...scripts, ...decisions, ...rules]), [scripts, decisions, rules])
  const [wrappedOpen, setWrappedOpen] = useState(false)

  if (decisions.length === 0) {
    return (
      <>
        <TopBar title="Insights" subtitle="A private mirror of your judgment" back />
        <EmptyState
          art={<SearchArt />}
          title="Nothing to reflect on yet"
          subtitle="Record a few decision receipts and the outcomes, and patterns about how you decide will appear here."
        />
      </>
    )
  }

  return (
    <>
      <TopBar title="Insights" subtitle="A private mirror of your judgment" back />

      {/* Calibration */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <ClarityRing
            value={cal.pct}
            label="Calibration"
            sublabel={
              cal.count === 0
                ? 'Record outcomes to begin'
                : `Across ${cal.count} reviewed decision${cal.count === 1 ? '' : 's'}`
            }
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          {cal.count === 0
            ? 'When a review comes due, open the decision and record how it turned out. Your calibration score reflects how often your decisions bring relief.'
            : `You feel good about your decisions ${cal.pct}% of the time. ${
                cal.pending > 0 ? `${cal.pending} are still waiting for an outcome.` : 'Beautifully kept up to date.'
              }`}
        </p>
      </Card>

      {/* Badges */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-serif text-lg text-ivory-50">Badges</h2>
        {streak > 0 && <span className="pill bg-gold-500/15 text-gold-300">🔥 {streak}-day streak</span>}
      </div>
      <Card className="mb-4">
        <div className="grid grid-cols-3 gap-3">
          {earned.map((b) => (
            <div
              key={b.id}
              className={`flex flex-col items-center rounded-2xl p-3 text-center transition ${
                b.earned ? 'bg-gold-400/10' : 'bg-white/[0.02] opacity-60'
              }`}
              title={b.desc}
            >
              <div className={`text-2xl ${b.earned ? '' : 'grayscale'}`}>{b.emoji}</div>
              <div className="mt-1 text-[11px] font-medium leading-tight text-ivory-50">{b.label}</div>
              {!b.earned && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-gold-400/60" style={{ width: `${b.progress * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Emotion timeline */}
      <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Your emotional trend</h2>
      <Card className="mb-4">
        <SparkLine points={emotions} />
        {emotions.length >= 2 && (
          <p className="mt-2 text-xs text-white/40">
            How you felt while deciding, oldest → newest. Above the line is calm/positive; below is fear/strain.
          </p>
        )}
      </Card>

      {/* Tells */}
      <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Your tells</h2>
      {tells.length === 0 ? (
        <Card className="mb-4">
          <p className="text-sm leading-relaxed text-white/55">
            Keep recording decisions and their outcomes. Once there’s enough signal, honest patterns about
            <em className="text-ivory-100/90"> when</em> and <em className="text-ivory-100/90">how</em> you decide
            best will surface here.
          </p>
        </Card>
      ) : (
        <div className="mb-4 space-y-3">
          {tells.map((t, i) => (
            <Card key={i} className="!p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <div className="font-semibold text-ivory-50">{t.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">{t.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Shareables */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setWrappedOpen(true)}
          className="card group relative overflow-hidden !p-4 text-left transition hover:bg-white/[0.06]"
        >
          <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-gold-500/25 blur-2xl" />
          <div className="text-2xl">🎁</div>
          <div className="mt-2 font-semibold text-ivory-50">Decision Wrapped</div>
          <div className="text-xs text-white/45">Your year, one card</div>
        </button>
        <button
          onClick={() => navigate('/quiz')}
          className="card group relative overflow-hidden !p-4 text-left transition hover:bg-white/[0.06]"
        >
          <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-lavender-500/25 blur-2xl" />
          <div className="text-2xl">🧠</div>
          <div className="mt-2 font-semibold text-ivory-50">Your decision style</div>
          <div className="text-xs text-white/45">60-second quiz</div>
        </button>
      </div>

      <SafetyNote className="mb-2">
        These reflections are generated on your device from your own entries — never uploaded. They’re patterns,
        not professional advice.
      </SafetyNote>

      <WrappedModal open={wrappedOpen} onClose={() => setWrappedOpen(false)} />
    </>
  )
}
