import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, Field, Input, Textarea, Select, SafetyNote } from '../components/ui.jsx'
import { StarIcon } from '../components/icons.jsx'
import { DECISION_CATEGORIES, STATUSES } from '../lib/constants.js'
import { clarityScore } from '../lib/clarity.js'
import ClarityRing from '../components/ClarityRing.jsx'
import { uid } from '../lib/id.js'

// Field schema for a decision receipt. Order matters — this is the form layout.
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
}

export default function ReceiptCreator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { decisions, saveTo, showToast } = useApp()

  const existing = useMemo(() => decisions.find((d) => d.id === id), [decisions, id])

  const [form, setForm] = useState(blank)
  const [category, setCategory] = useState('Personal')
  const [status, setStatus] = useState('draft')
  const [favorite, setFavorite] = useState(false)
  const [reviewDate, setReviewDate] = useState('')

  useEffect(() => {
    if (!existing) return
    setForm({ ...blank, ...existing })
    setCategory(existing.category || 'Personal')
    setStatus(existing.status || 'draft')
    setFavorite(!!existing.favorite)
    setReviewDate(existing.reviewDate ? existing.reviewDate.slice(0, 10) : '')
  }, [existing])

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }))

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
      createdAt: existing?.createdAt,
    }
    await saveTo('decisions', payload)
    showToast(existing ? 'Receipt updated' : 'Decision receipt saved')
    navigate('/library')
  }

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

      {/* Live clarity feedback as the receipt is filled in */}
      <Card className="mb-5 !p-4">
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

      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="space-y-4">
            <h2 className="font-serif text-lg text-ivory-50">{section.title}</h2>
            {section.fields.map((f) => (
              <Field key={f.key} label={f.label + (f.required ? ' *' : '')}>
                {f.type === 'area' ? (
                  <Textarea
                    rows={f.rows || 2}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </Card>
        ))}

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
