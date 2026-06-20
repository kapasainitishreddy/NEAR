import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, Chip, Field, Input, Textarea, Select, SafetyNote } from '../components/ui.jsx'
import { StarIcon } from '../components/icons.jsx'
import {
  DECISION_CATEGORIES,
  STATUSES,
  REVERSIBILITY,
  VALUE_SUGGESTIONS,
  outcomeMeta,
} from '../lib/constants.js'
import { clarityScore } from '../lib/clarity.js'
import ClarityRing from '../components/ClarityRing.jsx'
import BalanceScale from '../components/BalanceScale.jsx'
import DevilsAdvocate from '../components/DevilsAdvocate.jsx'
import RuleNudge from '../components/RuleNudge.jsx'
import DecisionMatrix, { emptyMatrix, matrixIsMeaningful } from '../components/DecisionMatrix.jsx'
import MicButton from '../components/MicButton.jsx'
import { uid } from '../lib/id.js'

const SECTIONS = [
  {
    title: 'The decision',
    fields: [
      { key: 'title', label: 'Decision title', type: 'input', placeholder: 'e.g. Why I chose Apartment B', required: true },
      { key: 'finalDecision', label: 'Final decision', type: 'area', rows: 2, placeholder: 'What did you actually decide?' },
      { key: 'optionsConsidered', label: 'Options considered', type: 'area', rows: 2, placeholder: 'List the choices you weighed' },
      { key: 'mainReason', label: 'Main reason', type: 'area', rows: 2, placeholder: 'The single biggest reason' },
    ],
  },
  {
    title: 'Weighing it',
    fields: [
      { key: 'pros', label: 'Pros', type: 'area', rows: 2, placeholder: 'What makes this a good call' },
      { key: 'cons', label: 'Cons', type: 'area', rows: 2, placeholder: 'The downsides you accept' },
      { key: 'risks', label: 'Risks', type: 'area', rows: 2, placeholder: 'What could go wrong' },
      { key: 'evidence', label: 'Evidence / facts', type: 'area', rows: 2, placeholder: 'What you actually know to be true' },
    ],
  },
  {
    title: 'The human side',
    fields: [
      { key: 'feelings', label: 'Feelings right now', type: 'area', rows: 2, placeholder: 'Name what you feel — no judgement' },
      { key: 'influencedBy', label: 'Who influenced this', type: 'area', rows: 2, placeholder: 'People, advice, or pressure' },
      { key: 'changeMind', label: 'What would change my mind', type: 'area', rows: 2, placeholder: 'The conditions that would make you reconsider' },
      { key: 'futureMeNote', label: 'Note to future me', type: 'area', rows: 3, placeholder: 'What do you want to remember about this moment?' },
    ],
  },
]

const blank = {
  title: '', finalDecision: '', optionsConsidered: '', mainReason: '', pros: '', cons: '',
  risks: '', evidence: '', feelings: '', influencedBy: '', changeMind: '', futureMeNote: '',
  premortem: '',
}

export default function ReceiptCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { decisions, rules, settings, saveTo, showToast } = useApp()

  const existing = useMemo(() => decisions.find((d) => d.id === id), [decisions, id])

  const [form, setForm] = useState(blank)
  const [category, setCategory] = useState('Personal')
  const [status, setStatus] = useState('draft')
  const [favorite, setFavorite] = useState(false)
  const [reviewDate, setReviewDate] = useState('')
  const [reversibility, setReversibility] = useState('')
  const [decideBy, setDecideBy] = useState('')
  const [valuesHonored, setValuesHonored] = useState([])
  const [valuesCost, setValuesCost] = useState([])
  const [sealNote, setSealNote] = useState(false)
  const [matrix, setMatrix] = useState(null)

  useEffect(() => {
    if (!existing) return
    setForm({ ...blank, ...existing })
    setCategory(existing.category || 'Personal')
    setStatus(existing.status || 'draft')
    setFavorite(!!existing.favorite)
    setReviewDate(existing.reviewDate ? existing.reviewDate.slice(0, 10) : '')
    setReversibility(existing.reversibility || '')
    setDecideBy(existing.decideBy ? existing.decideBy.slice(0, 10) : '')
    setValuesHonored(existing.valuesHonored || [])
    setValuesCost(existing.valuesCost || [])
    setSealNote(!!existing.sealNote)
    setMatrix(existing.matrix || null)
  }, [existing])

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }))
  const appendDictation = (key, text) =>
    setForm((p) => ({ ...p, [key]: p[key] ? `${p[key]} ${text}` : text }))

  // The most recent past decision in the same category — a "second opinion".
  const pastSelf = useMemo(() => {
    const others = decisions
      .filter((d) => d.id !== id && d.category === category && (d.mainReason || d.outcome))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return others[0] || null
  }, [decisions, id, category])

  const valuePool = settings?.values?.length ? settings.values : VALUE_SUGGESTIONS
  const toggleIn = (list, setList, v) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const save = async () => {
    if (!form.title.trim()) {
      showToast('Give your receipt a title first', 'error')
      return
    }
    const payload = {
      ...form,
      id: existing?.id || uid('decision'),
      type: 'decision',
      demo: existing?.demo || false,
      title: form.title.trim(),
      category,
      status,
      favorite,
      reviewDate: reviewDate ? new Date(reviewDate).toISOString() : '',
      reversibility,
      decideBy: decideBy ? new Date(decideBy).toISOString() : '',
      valuesHonored,
      valuesCost,
      sealNote: sealNote && !!reviewDate,
      matrix: matrix && matrixIsMeaningful(matrix) ? matrix : null,
      outcome: existing?.outcome || '',
      outcomeNote: existing?.outcomeNote || '',
      outcomeAt: existing?.outcomeAt || '',
      createdAt: existing?.createdAt,
    }
    await saveTo('decisions', payload)
    showToast(existing ? 'Receipt updated' : 'Decision receipt saved')
    navigate('/library')
  }

  const renderField = (f) => (
    <Field key={f.key} label={f.label + (f.required ? ' *' : '')}>
      {f.type === 'area' ? (
        <div className="flex items-start gap-2">
          <Textarea
            rows={f.rows || 2}
            placeholder={f.placeholder}
            value={form[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
          <MicButton onResult={(t) => appendDictation(f.key, t)} className="mt-1" />
        </div>
      ) : (
        <Input
          placeholder={f.placeholder}
          value={form[f.key]}
          onChange={(e) => set(f.key, e.target.value)}
        />
      )}
    </Field>
  )

  return (
    <>
      <TopBar
        title={existing ? 'Edit receipt' : 'Decision Receipt'}
        subtitle="Record why, for future-you"
        back
        right={
          <button
            onClick={() => setFavorite((f) => !f)}
            className={favorite ? 'text-gold-300' : 'text-white/30 hover:text-white/60'}
            aria-label="Favorite"
          >
            <StarIcon filled={favorite} className="h-6 w-6" />
          </button>
        }
      />

      {/* Live clarity feedback */}
      <Card className="mb-4 !p-4">
        {(() => {
          const score = clarityScore(form)
          return (
            <ClarityRing
              value={score.pct}
              label={`Clarity: ${score.label}`}
              sublabel="The more you reflect, the clearer future-you will see it."
            />
          )
        })()}
      </Card>

      {/* Rule-aware conscience */}
      <RuleNudge rules={rules} context={`${form.title} ${form.finalDecision} ${form.mainReason}`} className="mb-4" />

      {/* Your past self's second opinion */}
      {pastSelf && (
        <Card interactive onClick={() => navigate(`/view/decision/${pastSelf.id}`)} className="mb-4 !p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">🔁</span>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/45">
                Last {category} decision
              </div>
              <p className="truncate font-medium text-ivory-50">{pastSelf.title}</p>
              {pastSelf.outcome && outcomeMeta(pastSelf.outcome) && (
                <p className="mt-0.5 text-sm text-white/50">
                  You felt {outcomeMeta(pastSelf.outcome).emoji} {outcomeMeta(pastSelf.outcome).label.toLowerCase()} about it.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-4">
            <Card className="space-y-4">
              <h2 className="font-serif text-lg text-ivory-50">{section.title}</h2>
              {section.fields.map(renderField)}
            </Card>

            {/* Devil's advocate + balance scale right where you weigh it */}
            {section.title === 'Weighing it' && (
              <>
                <DevilsAdvocate />
                {(form.pros.trim() || form.cons.trim()) && (
                  <Card className="!p-4">
                    <div className="label-base">The balance</div>
                    <BalanceScale pros={form.pros} cons={form.cons} />
                  </Card>
                )}
              </>
            )}
          </div>
        ))}

        {/* Pre-mortem */}
        <Card className="space-y-3">
          <h2 className="font-serif text-lg text-ivory-50">Pre-mortem ⚰️</h2>
          <p className="-mt-1 text-sm text-white/45">
            Imagine it’s six months from now and this decision failed. What went wrong?
          </p>
          <div className="flex items-start gap-2">
            <Textarea
              rows={3}
              placeholder="The most likely reasons this could go badly…"
              value={form.premortem}
              onChange={(e) => set('premortem', e.target.value)}
            />
            <MicButton onResult={(t) => appendDictation('premortem', t)} className="mt-1" />
          </div>
        </Card>

        {/* Decision matrix (optional) */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ivory-50">Decision matrix ▦</h2>
            {!matrix && (
              <Button variant="ghost" size="sm" onClick={() => setMatrix(emptyMatrix())}>
                Add
              </Button>
            )}
          </div>
          {matrix ? (
            <>
              <DecisionMatrix value={matrix} onChange={setMatrix} />
              <button onClick={() => setMatrix(null)} className="text-sm text-white/40 hover:text-red-300">
                Remove matrix
              </button>
            </>
          ) : (
            <p className="-mt-1 text-sm text-white/45">
              Score your options against what matters and let the weights pick a winner.
            </p>
          )}
        </Card>

        {/* Decide well: reversibility, deadline, values */}
        <Card className="space-y-4">
          <h2 className="font-serif text-lg text-ivory-50">Decide well</h2>

          <Field label="How reversible is this?">
            <div className="flex gap-2">
              {REVERSIBILITY.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReversibility(reversibility === r.id ? '' : r.id)}
                  className={`flex-1 rounded-2xl border px-3 py-3 text-left transition ${
                    reversibility === r.id
                      ? 'border-gold-400/40 bg-gold-400/10'
                      : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-sm font-semibold text-ivory-50">
                    {r.emoji} {r.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-white/45">{r.hint}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Decide by" hint="A gentle deadline so the choice doesn’t drift forever.">
            <Input type="date" value={decideBy} onChange={(e) => setDecideBy(e.target.value)} />
          </Field>

          <div>
            <div className="label-base">Values this honors</div>
            <div className="flex flex-wrap gap-2">
              {valuePool.map((v) => (
                <Chip key={v} active={valuesHonored.includes(v)} onClick={() => toggleIn(valuesHonored, setValuesHonored, v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="label-base">Values this costs</div>
            <div className="flex flex-wrap gap-2">
              {valuePool.map((v) => (
                <Chip key={v} active={valuesCost.includes(v)} onClick={() => toggleIn(valuesCost, setValuesCost, v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* Filing */}
        <Card className="space-y-4">
          <h2 className="font-serif text-lg text-ivory-50">Filing</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {DECISION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Review date" hint="Get a nudge on Home when this comes due.">
            <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </Field>

          {/* Time-locked note to future-me */}
          <label
            className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
              reviewDate ? 'border-white/[0.08] bg-white/[0.02]' : 'border-white/[0.05] opacity-50'
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-gold-400"
              checked={sealNote}
              disabled={!reviewDate}
              onChange={(e) => setSealNote(e.target.checked)}
            />
            <span className="text-sm">
              <span className="font-medium text-ivory-50">🔒 Seal my note to future-me</span>
              <span className="mt-0.5 block text-xs text-white/45">
                Your “note to future me” stays hidden until the review date — a letter you can’t peek at early.
                {!reviewDate && ' Set a review date to enable.'}
              </span>
            </span>
          </label>
        </Card>

        <SafetyNote>
          This is a writing and reflection tool, not legal, medical, financial, or therapy advice. Review before
          acting on it.
        </SafetyNote>

        <Button size="lg" className="w-full" onClick={save}>
          {existing ? 'Update receipt' : 'Save decision receipt'}
        </Button>
      </div>
    </>
  )
}
