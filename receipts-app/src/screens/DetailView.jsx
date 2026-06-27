import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, StatusBadge, Select, SafetyNote } from '../components/ui.jsx'
import { ConfirmModal } from '../components/Modal.jsx'
import { CopyIcon, TrashIcon, StarIcon, ClockIcon, ShareIcon, EditIcon, ChartIcon, SpeakerIcon, StopIcon } from '../components/icons.jsx'
import { speak, stopSpeaking, speechSupported } from '../lib/speech.js'
import { cancelForItem } from '../lib/notifications.js'
import { STATUSES, reversibilityMeta, outcomeMeta } from '../lib/constants.js'
import { fmtDate, fmtRelative, isDue } from '../lib/format.js'
import { getCategory } from '../lib/scriptTemplates.js'
import { shareText } from '../lib/haptics.js'
import { clarityScore } from '../lib/clarity.js'
import { snapshotText } from '../lib/db.js'
import { diffWords, hasChanges } from '../lib/diff.js'
import { matrixTotals, matrixIsMeaningful } from '../components/DecisionMatrix.jsx'
import ClarityRing from '../components/ClarityRing.jsx'
import BalanceScale from '../components/BalanceScale.jsx'
import ShareCardModal from '../components/ShareCardModal.jsx'
import OutcomeModal from '../components/OutcomeModal.jsx'

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
  ['premortem', 'Pre-mortem'],
  ['futureMeNote', 'Note to future me'],
]

export default function DetailView() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { scripts, decisions, settings, saveTo, deleteFrom, showToast } = useApp()
  const [confirm, setConfirm] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [outcomeOpen, setOutcomeOpen] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => stopSpeaking(), [])

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

  // A sealed "note to future me" stays hidden until the review date arrives.
  const noteSealed = !isScript && item.sealNote && item.reviewDate && !isDue(item.reviewDate)
  const visibleFields = DECISION_FIELDS.filter(([k]) => item[k] && !(k === 'futureMeNote' && noteSealed))

  const asText = () =>
    isScript
      ? item.content
      : visibleFields.map(([k, label]) => `${label}: ${item[k]}`).join('\n\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText())
      showToast('Copied to clipboard')
    } catch {
      showToast('Copy failed', 'error')
    }
  }

  const share = async () => {
    const result = await shareText({ title: item.title || 'Receipts', text: asText() })
    if (result === 'copied') showToast('Copied to clipboard')
    else if (result === 'failed') showToast('Could not share', 'error')
  }

  const listen = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(true)
    speak(asText(), {
      voiceURI: settings.speechVoice,
      rate: settings.speechRate || 1,
      onend: () => setSpeaking(false),
    })
  }

  const due = isDue(item.reviewDate)
  const rev = reversibilityMeta(item.reversibility)
  const outcome = outcomeMeta(item.outcome)
  const decideByDue = item.decideBy && !item.outcome
  const matrix = item.matrix && matrixIsMeaningful(item.matrix) ? item.matrix : null
  const totals = matrix ? matrixTotals(matrix) : []
  const winner = totals.reduce((a, b) => (b.total > (a?.total ?? -1) ? b : a), null)

  // Revision diff (latest vs previous saved version)
  const diffTokens = useMemo(() => {
    if (!item.history?.length) return null
    const prev = item.history[item.history.length - 1].text
    const tokens = diffWords(prev, snapshotText(item))
    return hasChanges(tokens) ? tokens : null
  }, [item])

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

      {/* Clarity score — decisions only */}
      {!isScript && (
        <Card className="mb-4 !p-4">
          {(() => {
            const score = clarityScore(item)
            return (
              <ClarityRing
                value={score.pct}
                label={score.label}
                sublabel={`${score.filled} of ${score.total} reflection fields filled`}
              />
            )
          })()}
        </Card>
      )}

      {/* Outcome / calibration — decisions only */}
      {!isScript && (
        <Card className="mb-4 !p-4">
          {outcome ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{outcome.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ivory-50">Outcome: {outcome.label}</div>
                {item.outcomeNote && <p className="text-sm text-white/50">{item.outcomeNote}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOutcomeOpen(true)}>
                Change
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <p className="flex-1 text-sm text-white/55">
                {due ? 'This is due for review — how did it turn out?' : 'Record how this turned out to build your calibration.'}
              </p>
              <Button size="sm" onClick={() => setOutcomeOpen(true)}>
                Record
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Status + review controls */}
      <Card className="mb-4 !p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />
          {rev && <span className={`pill ${rev.tone}`}>{rev.emoji} {rev.label}</span>}
          {item.reviewDate && (
            <span className={`pill ${due ? 'bg-gold-500/15 text-gold-300' : 'bg-white/[0.04] text-white/45'}`}>
              <ClockIcon className="h-3.5 w-3.5" />
              {due ? 'Review due' : `Review ${fmtDate(item.reviewDate)}`}
            </span>
          )}
          {decideByDue && (
            <span className={`pill ${isDue(item.decideBy) ? 'bg-red-500/15 text-red-300' : 'bg-lavender-500/15 text-lavender-300'}`}>
              ⏱️ Decide {fmtRelative(item.decideBy)}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Select value={item.status} onChange={(e) => patch({ status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                Mark as: {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-2 text-right text-xs text-white/35">Updated {fmtDate(item.updatedAt)}</div>
      </Card>

      {/* Values compass */}
      {!isScript && (item.valuesHonored?.length || item.valuesCost?.length) ? (
        <Card className="mb-4 !p-4">
          <div className="label-base">Values</div>
          {item.valuesHonored?.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-emerald-300">Honored</span>
              {item.valuesHonored.map((v) => (
                <span key={v} className="pill bg-emerald-500/15 text-emerald-300">{v}</span>
              ))}
            </div>
          )}
          {item.valuesCost?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/45">Cost</span>
              {item.valuesCost.map((v) => (
                <span key={v} className="pill bg-white/[0.05] text-white/55">{v}</span>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      {/* Decision matrix result */}
      {matrix && winner && (
        <Card className="mb-4 !p-4">
          <div className="label-base">Decision matrix</div>
          <div className="space-y-2">
            {totals
              .filter((t) => t.opt.trim())
              .sort((a, b) => b.total - a.total)
              .map((t) => (
                <div key={t.i}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ivory-50">
                      {winner.i === t.i ? '👑 ' : ''}
                      {t.opt}
                    </span>
                    <span className="text-white/45">{t.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500"
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Body */}
      {isScript ? (
        <>
          <Card className="mb-4">
            <div className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-ivory-100/90">
              {item.content}
            </div>
          </Card>
          {item.branches?.length > 0 && (
            <Card className="mb-4 !p-4">
              <div className="label-base">If they react… 🌿</div>
              <div className="space-y-3">
                {item.branches.map((b, i) => (
                  <div key={i}>
                    <div className="text-sm font-medium text-gold-300">{b.trigger}</div>
                    <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed text-ivory-100/90">
                      {b.reply}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <div className="mb-4 space-y-3">
          {visibleFields.map(([k, label]) => (
            <Card key={k} className="!p-4">
              <div className="label-base">{label}</div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ivory-100/90">{item[k]}</p>
            </Card>
          ))}

          {/* Pros vs cons balance */}
          {(item.pros || item.cons) && (
            <Card className="!p-4">
              <div className="label-base">The balance</div>
              <BalanceScale pros={item.pros} cons={item.cons} />
            </Card>
          )}

          {/* Sealed letter to future-me */}
          {noteSealed && (
            <Card className="!p-5 text-center">
              <div className="mb-2 text-3xl">🔒</div>
              <h3 className="font-serif text-lg text-ivory-50">A sealed letter to future-you</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-white/50">
                Your note unseals on {fmtDate(item.reviewDate)} ({fmtRelative(item.reviewDate)}). No peeking.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* What changed */}
      {diffTokens && (
        <Card className="mb-4 !p-4">
          <button onClick={() => setShowDiff((s) => !s)} className="flex w-full items-center justify-between">
            <span className="label-base !mb-0">What changed since last edit</span>
            <span className="text-sm text-gold-300/80">{showDiff ? 'Hide' : 'Show'}</span>
          </button>
          {showDiff && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
              {diffTokens.map((t, i) =>
                t.type === 'same' ? (
                  <span key={i}>{t.value}</span>
                ) : t.type === 'add' ? (
                  <span key={i} className="rounded bg-emerald-500/20 text-emerald-200">{t.value}</span>
                ) : (
                  <span key={i} className="rounded bg-red-500/15 text-red-300/80 line-through">{t.value}</span>
                )
              )}
            </p>
          )}
        </Card>
      )}

      <div className="mb-4 space-y-2">
        <Button variant="accent" className="w-full" onClick={() => setCardOpen(true)}>
          <ShareIcon className="h-4 w-4" /> Share as a receipt
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={copy}>
            <CopyIcon className="h-4 w-4" /> Copy
          </Button>
          <Button variant="secondary" className="flex-1" onClick={share}>
            <ShareIcon className="h-4 w-4" /> Share text
          </Button>
        </div>
        {speechSupported() && (
          <Button variant="secondary" className="w-full" onClick={listen}>
            {speaking ? <StopIcon className="h-4 w-4" /> : <SpeakerIcon className="h-4 w-4" />}
            {speaking ? 'Stop' : 'Listen'}
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => navigate(isScript ? `/script/${item.id}` : `/receipt/${item.id}`)}
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Button>
          <Button variant="danger" size="icon" onClick={() => setConfirm(true)} aria-label="Delete">
            <TrashIcon />
          </Button>
        </div>
        {!isScript && (
          <Button variant="ghost" className="w-full" onClick={() => navigate('/insights')}>
            <ChartIcon className="h-4 w-4" /> See your insights
          </Button>
        )}
      </div>

      <SafetyNote>
        This is a writing and reflection tool, not legal, medical, financial, or therapy advice. Review before
        sending or acting.
      </SafetyNote>

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          cancelForItem(item.id)
          await deleteFrom(collection, item.id)
          showToast('Deleted')
          navigate('/library')
        }}
        title="Delete this item?"
        body="This permanently removes it from this device."
        confirmLabel="Delete"
      />

      <ShareCardModal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        item={noteSealed ? { ...item, futureMeNote: '' } : item}
      />
      <OutcomeModal
        open={outcomeOpen}
        onClose={() => setOutcomeOpen(false)}
        item={item}
        onSave={(p) => {
          patch(p)
          showToast('Outcome recorded')
        }}
      />
    </>
  )
}
