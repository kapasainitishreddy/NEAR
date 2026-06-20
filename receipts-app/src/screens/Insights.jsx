import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Card, EmptyState, SafetyNote } from '../components/ui.jsx'
import ClarityRing from '../components/ClarityRing.jsx'
import SparkLine from '../components/SparkLine.jsx'
import { SearchArt } from '../components/illustrations.jsx'
import { calibration, patterns, emotionSeries } from '../lib/insights.js'

export default function Insights() {
  const { decisions } = useApp()
  const navigate = useNavigate()

  const cal = useMemo(() => calibration(decisions), [decisions])
  const tells = useMemo(() => patterns(decisions), [decisions])
  const emotions = useMemo(() => emotionSeries(decisions), [decisions])

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

      <SafetyNote className="mb-2">
        These reflections are generated on your device from your own entries — never uploaded. They’re patterns,
        not professional advice.
      </SafetyNote>
    </>
  )
}
