import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, Chip, Field, Input, Textarea, Select, SafetyNote } from '../components/ui.jsx'
import { CopyIcon, StarIcon } from '../components/icons.jsx'
import { STATUSES } from '../lib/constants.js'
import {
  SCRIPT_CATEGORIES,
  SCRIPT_FIELDS,
  TONES,
  generateScript,
  getCategory,
} from '../lib/scriptTemplates.js'
import RuleNudge from '../components/RuleNudge.jsx'
import MicButton from '../components/MicButton.jsx'
import CooldownModal from '../components/CooldownModal.jsx'
import AiCopilotButton from '../components/AiCopilotButton.jsx'
import { improveScript } from '../lib/ai.js'
import { uid } from '../lib/id.js'

const blankInputs = { recipient: '', context: '', detail: '', name: '' }

// Categories likely to be written in a charged moment — these get a cooldown.
const HEATED = new Set(['apology', 'boundary', 'complaint', 'support', 'roommate', 'cancel'])

// Default branches for "conversation rehearsal".
const DEFAULT_BRANCHES = [
  { trigger: 'If they push back', reply: '' },
  { trigger: 'If they agree', reply: '' },
  { trigger: 'If they get defensive', reply: '' },
]

export default function ScriptGenerator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { scripts, rules, saveTo, showToast } = useApp()

  const existing = useMemo(() => scripts.find((s) => s.id === id), [scripts, id])

  const [categoryId, setCategoryId] = useState('apology')
  const [inputs, setInputs] = useState(blankInputs)
  const [versions, setVersions] = useState(null)
  const [tone, setTone] = useState('soft')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('draft')
  const [favorite, setFavorite] = useState(false)
  const [reviewDate, setReviewDate] = useState('')
  const [branches, setBranches] = useState(DEFAULT_BRANCHES)
  const [cooldownOpen, setCooldownOpen] = useState(false)
  const [step, setStep] = useState(1) // 1 = compose, 2 = refine

  // Hydrate when editing an existing script.
  useEffect(() => {
    if (!existing) return
    setCategoryId(existing.categoryId || 'apology')
    setInputs({ ...blankInputs, ...(existing.inputs || {}) })
    setVersions(existing.versions || null)
    setTone(existing.tone || 'soft')
    setContent(existing.content || '')
    setTitle(existing.title || '')
    setStatus(existing.status || 'draft')
    setFavorite(!!existing.favorite)
    setReviewDate(existing.reviewDate ? existing.reviewDate.slice(0, 10) : '')
    setBranches(existing.branches?.length ? existing.branches : DEFAULT_BRANCHES)
    setStep(2)
  }, [existing])

  const cat = getCategory(categoryId)

  const handleGenerate = () => {
    const v = generateScript(categoryId, inputs)
    setVersions(v)
    setTone('soft')
    setContent(v.soft)
    if (!title) {
      const subject = inputs.context ? inputs.context.trim() : cat.label
      setTitle(subject.charAt(0).toUpperCase() + subject.slice(1))
    }
    setStep(2)
  }

  const pickTone = (t) => {
    setTone(t)
    if (versions) setContent(versions[t])
  }

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      showToast('Copied to clipboard')
    } catch {
      showToast('Copy failed — select and copy manually', 'error')
    }
  }

  // Heated messages get a brief cooldown before copying.
  const copy = () => {
    if (HEATED.has(categoryId)) setCooldownOpen(true)
    else doCopy()
  }

  const setBranch = (i, patch) =>
    setBranches((bs) => bs.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))

  const save = async () => {
    const payload = {
      id: existing?.id || uid('script'),
      type: 'script',
      demo: existing?.demo || false,
      title: title.trim() || cat.label,
      categoryId,
      inputs,
      versions: versions || generateScript(categoryId, inputs),
      tone,
      content,
      status,
      favorite,
      reviewDate: reviewDate ? new Date(reviewDate).toISOString() : '',
      branches: branches.filter((b) => b.reply.trim()),
      createdAt: existing?.createdAt,
    }
    await saveTo('scripts', payload)
    showToast(existing ? 'Script updated' : 'Script saved to Library')
    navigate('/library')
  }

  return (
    <>
      <TopBar
        title={existing ? 'Edit script' : 'Panic Script'}
        subtitle="Calm words, three ways"
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

      {/* Step 1 — compose */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div>
              <span className="label-base">What do you need to say?</span>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar">
                {SCRIPT_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border px-4 py-3 transition ${
                      categoryId === c.id
                        ? 'border-gold-400/40 bg-gold-400/10'
                        : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="w-20 text-center text-[11px] font-medium leading-tight text-white/70">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-white/45">{cat.blurb}</p>
            </div>

            <Card className="space-y-4">
              {Object.entries(SCRIPT_FIELDS).map(([key, f]) => (
                <Field key={key} label={f.label}>
                  {key === 'detail' ? (
                    <Textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={inputs[key]}
                      onChange={(e) => setInputs((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      placeholder={f.placeholder}
                      value={inputs[key]}
                      onChange={(e) => setInputs((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  )}
                </Field>
              ))}
            </Card>

            <Button size="lg" className="w-full" onClick={handleGenerate}>
              ✨ Generate 3 versions
            </Button>

            <SafetyNote>
              Generated locally on your device from built-in templates — no AI service, no internet needed. Always
              read and edit before sending.
            </SafetyNote>
          </motion.div>
        )}

        {/* Step 2 — refine */}
        {step === 2 && (
          <motion.div
            key="refine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => pickTone(t.id)}
                  className={`flex-1 rounded-2xl border px-2 py-3 text-center transition ${
                    tone === t.id
                      ? 'border-lavender-400/40 bg-lavender-500/10'
                      : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-lg">{t.emoji}</div>
                  <div className="text-sm font-semibold text-ivory-50">{t.label}</div>
                  <div className="text-[10px] text-white/40">{t.hint}</div>
                </button>
              ))}
            </div>

            <RuleNudge rules={rules} context={`${cat.label} ${inputs.context} ${content}`} />

            <Field label="Your message — edit freely">
              <div className="flex items-start gap-2">
                <Textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
                <MicButton
                  onResult={(t) => setContent((c) => (c ? `${c} ${t}` : t))}
                  className="mt-1"
                />
              </div>
            </Field>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={copy}>
                <CopyIcon className="h-4 w-4" /> Copy
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  if (versions) setContent(versions[tone])
                  showToast('Reset to template')
                }}
              >
                Reset edits
              </Button>
            </div>

            <AiCopilotButton
              label="✨ Improve with AI"
              className="w-full"
              run={() => improveScript(content, TONES.find((t) => t.id === tone)?.label?.toLowerCase())}
              onResult={(out) => {
                setContent(out)
                showToast('Refined by AI co-pilot')
              }}
            />

            {/* Conversation rehearsal — pre-draft replies to likely reactions */}
            <Card className="space-y-3">
              <div>
                <h2 className="font-serif text-lg text-ivory-50">Rehearse their reply 🌿</h2>
                <p className="mt-0.5 text-sm text-white/45">
                  Pre-write your calm response to how they might react — so you’re never caught off guard.
                </p>
              </div>
              {branches.map((b, i) => (
                <Field key={i} label={b.trigger}>
                  <div className="flex items-start gap-2">
                    <Textarea
                      rows={2}
                      placeholder="Your calm reply…"
                      value={b.reply}
                      onChange={(e) => setBranch(i, { reply: e.target.value })}
                    />
                    <MicButton
                      onResult={(t) => setBranch(i, { reply: b.reply ? `${b.reply} ${t}` : t })}
                      className="mt-1"
                    />
                  </div>
                </Field>
              ))}
            </Card>

            <Card className="space-y-4">
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this script" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Review on">
                  <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
                </Field>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={save}>
                {existing ? 'Update script' : 'Save to Library'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CooldownModal
        open={cooldownOpen}
        onClose={() => setCooldownOpen(false)}
        text={content}
        onProceed={doCopy}
      />
    </>
  )
}
