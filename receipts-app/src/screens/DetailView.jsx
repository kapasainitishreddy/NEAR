import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, StatusBadge, Select, SafetyNote } from '../components/ui.jsx'
import { ConfirmModal } from '../components/Modal.jsx'
import { CopyIcon, TrashIcon, StarIcon, ClockIcon } from '../components/icons.jsx'
import { STATUSES } from '../lib/constants.js'
import { fmtDate, isDue } from '../lib/format.js'
import { getCategory } from '../lib/scriptTemplates.js'

const DECISION_FIELDS = [
  ['finalDecision', 'Final decision'],
  ['optionsConsidered', 'Options considered'],
  ['mainReason', 'Main reason'],
  ['pros', 'Pros'],
  ['cons', 'Cons'],
  ['risks', 'Risks'],
  ['evidence', 'Evidence / facts'],
  ['feelings', 'Feelings at the time'],
  ['influencedBy', 'Who influenced this'],
  ['changeMind', 'What would change my mind'],
  ['futureMeNote', 'Note to future me'],
]

export default function DetailView() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { scripts, decisions, saveTo, deleteFrom, showToast } = useApp()
  const [confirm, setConfirm] = useState(false)

  const collection = type === 'script' ? 'scripts' : 'decisions'
  const item = useMemo(
    () => (type === 'script' ? scripts : decisions).find((i) => i.id === id),
    [type, scripts, decisions, id]
  )

  if (!item) {
    return (
      <>
        <TopBar title="Not found" back />
        <Card>
          <p className="text-white/55">This item no longer exists.</p>
          <Button className="mt-4" onClick={() => navigate('/library')}>
            Back to Library
          </Button>
        </Card>
      </>
    )
  }

  const isScript = item.type === 'script'

  const patch = (p) => saveTo(collection, { ...item, ...p })

  const copy = async () => {
    const text = isScript
      ? item.content
      : DECISION_FIELDS.filter(([k]) => item[k]).map(([k, label]) => `${label}: ${item[k]}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied to clipboard')
    } catch {
      showToast('Copy failed', 'error')
    }
  }

  const due = isDue(item.reviewDate)

  return (
    <>
      <TopBar
        title={item.title}
        subtitle={isScript ? getCategory(item.categoryId).label : item.category}
        back
        right={
          <button
            onClick={() => patch({ favorite: !item.favorite })}
            className={item.favorite ? 'text-gold-300' : 'text-white/30 hover:text-white/60'}
            aria-label="Favorite"
          >
            <StarIcon filled={item.favorite} className="h-6 w-6" />
          </button>
        }
      />

      {item.demo && (
        <div className="mb-4 rounded-2xl border border-lavender-400/20 bg-lavender-500/10 px-4 py-2 text-xs text-lavender-300">
          Sample item — remove all demo data anytime from Settings.
        </div>
      )}

      {/* Status + review controls */}
      <Card className="mb-4 !p-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={item.status} />
          {item.reviewDate && (
            <span className={`pill ${due ? 'bg-gold-500/15 text-gold-300' : 'bg-white/[0.04] text-white/45'}`}>
              <ClockIcon className="h-3.5 w-3.5" />
              {due ? 'Review due' : `Review ${fmtDate(item.reviewDate)}`}
            </span>
          )}
          <span className="ml-auto text-xs text-white/35">Updated {fmtDate(item.updatedAt)}</span>
        </div>
        <div className="mt-3">
          <Select value={item.status} onChange={(e) => patch({ status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                Mark as: {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Body */}
      {isScript ? (
        <Card className="mb-4">
          <div className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ivory-100/90">
            {item.content}
          </div>
        </Card>
      ) : (
        <div className="mb-4 space-y-3">
          {DECISION_FIELDS.filter(([k]) => item[k]).map(([k, label]) => (
            <Card key={k} className="!p-4">
              <div className="label-base">{label}</div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ivory-100/90">{item[k]}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={copy}>
          <CopyIcon className="h-4 w-4" /> Copy
        </Button>
        <Button
          className="flex-1"
          onClick={() => navigate(isScript ? `/script/${item.id}` : `/receipt/${item.id}`)}
        >
          Edit
        </Button>
        <Button variant="danger" size="icon" onClick={() => setConfirm(true)} aria-label="Delete">
          <TrashIcon />
        </Button>
      </div>

      <SafetyNote>
        This is a writing and reflection tool, not legal, medical, financial, or therapy advice. Review before
        sending or acting.
      </SafetyNote>

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await deleteFrom(collection, item.id)
          showToast('Deleted')
          navigate('/library')
        }}
        title="Delete this item?"
        body="This permanently removes it from this device."
        confirmLabel="Delete"
      />
    </>
  )
}
