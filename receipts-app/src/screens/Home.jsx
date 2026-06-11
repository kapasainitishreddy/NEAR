import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, EmptyState, SafetyNote } from '../components/ui.jsx'
import ItemCard from '../components/ItemCard.jsx'
import { ScriptIcon, ReceiptIcon, ClockIcon, PlusIcon } from '../components/icons.jsx'
import { isDue, isUpcoming, fmtRelative } from '../lib/format.js'

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
      <div className="font-serif text-2xl text-ivory-50">{value}</div>
      <div className="text-xs text-white/45">{label}</div>
    </Card>
  )
}

export default function Home() {
  const { scripts, decisions, rules } = useApp()
  const navigate = useNavigate()

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

  return (
    <>
      <TopBar title={`${greeting()}.`} subtitle="Save what you decided. Say what you need." />

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/script')}
          className="card flex flex-col items-start gap-3 !p-4 text-left hover:bg-white/[0.06]"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-lavender-500/15 text-lavender-300">
            <ScriptIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-ivory-50">New Script</div>
            <div className="text-xs text-white/45">Find the words</div>
          </div>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/receipt')}
          className="card flex flex-col items-start gap-3 !p-4 text-left hover:bg-white/[0.06]"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/15 text-gold-300">
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

      {empty && (
        <EmptyState
          emoji="🌅"
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
            <h2 className="font-serif text-lg text-ivory-50">Recent</h2>
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
    </>
  )
}
