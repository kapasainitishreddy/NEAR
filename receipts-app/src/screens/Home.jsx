import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, EmptyState, SafetyNote } from '../components/ui.jsx'
import ItemCard from '../components/ItemCard.jsx'
import { ScriptIcon, ReceiptIcon, ClockIcon, PlusIcon, ChartIcon, CoinIcon, SettingsIcon } from '../components/icons.jsx'
import { CalmPageArt } from '../components/illustrations.jsx'
import CoinFlipModal from '../components/CoinFlipModal.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { isDue, isUpcoming, fmtRelative } from '../lib/format.js'
import { dailyPrompt } from '../lib/prompts.js'
import { computeStreak } from '../lib/gamification.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function StatTile({ Icon, label, value, accent, onClick }) {
  return (
    <Card interactive onClick={onClick} className="!p-4">
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-serif text-2xl text-ivory-50">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-xs text-white/45">{label}</div>
    </Card>
  )
}

export default function Home() {
  const { scripts, decisions, rules, settings } = useApp()
  const navigate = useNavigate()
  const name = settings?.name?.trim()

  const all = useMemo(() => [...scripts, ...decisions], [scripts, decisions])

  const dueReviews = useMemo(
    () => all.filter((i) => isDue(i.reviewDate)).sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate)),
    [all]
  )
  const upcoming = useMemo(
    () => all.filter((i) => isUpcoming(i.reviewDate)).sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate)),
    [all]
  )
  const recent = useMemo(
    () => [...all].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4),
    [all]
  )

  const empty = all.length === 0 && rules.length === 0
  const [coinOpen, setCoinOpen] = useState(false)
  const prompt = useMemo(() => dailyPrompt(), [])
  const streak = useMemo(() => computeStreak([...all, ...rules]), [all, rules])

  const decideSoon = useMemo(
    () =>
      decisions
        .filter((d) => d.decideBy && !d.outcome)
        .sort((a, b) => new Date(a.decideBy) - new Date(b.decideBy)),
    [decisions]
  )

  return (
    <>
      <TopBar
        title={
          <span>
            {greeting()}
            {name ? <span className="text-gradient">, {name}</span> : ''}.
          </span>
        }
        subtitle="Save what you decided. Say what you need."
        right={
          <div className="flex items-center gap-1">
            {streak > 1 && (
              <span
                className="pill mr-1 bg-gold-500/15 text-gold-300"
                title={`${streak}-day reflection streak`}
              >
                🔥 {streak}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate('/insights')} aria-label="Insights">
              <ChartIcon />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} aria-label="Settings">
              <SettingsIcon />
            </Button>
          </div>
        }
      />

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={() => navigate('/script')}
          className="card group relative overflow-hidden flex flex-col items-start gap-3 !p-4 text-left"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-lavender-500/20 blur-2xl transition group-hover:bg-lavender-500/30" />
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-lavender-400/30 to-lavender-500/10 text-lavender-300">
            <ScriptIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-ivory-50">New Script</div>
            <div className="text-xs text-white/45">Find the words</div>
          </div>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={() => navigate('/receipt')}
          className="card group relative overflow-hidden flex flex-col items-start gap-3 !p-4 text-left"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold-500/20 blur-2xl transition group-hover:bg-gold-500/30" />
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-300/30 to-gold-500/10 text-gold-300">
            <ReceiptIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-ivory-50">New Receipt</div>
            <div className="text-xs text-white/45">Record a decision</div>
          </div>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile
          Icon={ScriptIcon}
          label="Scripts"
          value={scripts.length}
          accent="bg-lavender-500/15 text-lavender-300"
          onClick={() => navigate('/library')}
        />
        <StatTile
          Icon={ReceiptIcon}
          label="Receipts"
          value={decisions.length}
          accent="bg-gold-500/15 text-gold-300"
          onClick={() => navigate('/library')}
        />
        <StatTile
          Icon={ClockIcon}
          label="To review"
          value={dueReviews.length}
          accent="bg-emerald-500/15 text-emerald-300"
          onClick={() => navigate('/library')}
        />
      </div>

      {/* Today — daily reflection prompt */}
      {!empty && (
        <Card className="mb-6 !p-5">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lavender-300">
            <span>✦</span> Today’s reflection
          </div>
          <p className="font-serif text-lg leading-snug text-ivory-50">{prompt}</p>
          <button
            onClick={() => navigate('/receipt')}
            className="mt-3 text-sm font-medium text-gold-300/90 hover:text-gold-300"
          >
            Reflect on this →
          </button>
        </Card>
      )}

      {/* Decide-by deadlines */}
      {decideSoon.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-ivory-50">
            <span>⏱️</span> Waiting on a decision
          </h2>
          <div className="space-y-3">
            {decideSoon.slice(0, 3).map((d) => {
              const overdue = isDue(d.decideBy)
              return (
                <Card
                  key={d.id}
                  interactive
                  onClick={() => navigate(`/view/decision/${d.id}`)}
                  className="!p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{overdue ? '⚠️' : '🗳️'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ivory-50">{d.title}</div>
                      <div className={`text-xs ${overdue ? 'text-red-300' : 'text-white/45'}`}>
                        {overdue ? 'Decide now — ' : 'Decide '}
                        {fmtRelative(d.decideBy)}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Flip a coin */}
      <button
        onClick={() => setCoinOpen(true)}
        className="card mb-6 flex w-full items-center gap-3 !p-4 text-left transition hover:bg-white/[0.06]"
      >
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/15 text-gold-300">
          <CoinIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-ivory-50">Flip for a small choice</div>
          <div className="text-xs text-white/45">Let your gut reaction reveal the answer</div>
        </div>
      </button>

      {empty && (
        <EmptyState
          art={<CalmPageArt />}
          title="A calm, blank page"
          subtitle="Nothing here yet. Write your first calm script, or record the reasoning behind a decision."
          action={
            <div className="flex gap-2">
              <Button onClick={() => navigate('/script')}>
                <PlusIcon className="h-4 w-4" /> Script
              </Button>
              <Button variant="secondary" onClick={() => navigate('/receipt')}>
                <PlusIcon className="h-4 w-4" /> Receipt
              </Button>
            </div>
          }
        />
      )}

      {/* Reviews due */}
      {dueReviews.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-ivory-50">
            <span className="text-gold-300">⏰</span> Time to review
          </h2>
          <div className="space-y-3">
            {dueReviews.slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Recent</h2>
            <button onClick={() => navigate('/library')} className="text-sm text-gold-300/80 hover:text-gold-300">
              See all
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming reviews hint */}
      {upcoming.length > 0 && (
        <Card className="mb-6 !p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🗓️</span>
            <p className="text-sm text-white/55">
              You have <span className="text-ivory-50">{upcoming.length}</span> review
              {upcoming.length > 1 ? 's' : ''} coming up — next one {fmtRelative(upcoming[0].reviewDate)}.
            </p>
          </div>
        </Card>
      )}

      <SafetyNote className="mb-2">
        This is a writing and reflection tool, not legal, medical, financial, or therapy advice. Review before
        sending or acting.
      </SafetyNote>

      <CoinFlipModal open={coinOpen} onClose={() => setCoinOpen(false)} />
    </>
  )
}
