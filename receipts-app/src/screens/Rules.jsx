import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, EmptyState, Field, Input, Textarea, SafetyNote } from '../components/ui.jsx'
import { ConfirmModal } from '../components/Modal.jsx'
import { PlusIcon, TrashIcon } from '../components/icons.jsx'
import { uid } from '../lib/id.js'

const SUGGESTIONS = [
  'Do not reply when angry.',
  'Sleep on big purchases for 24 hours.',
  'Say the boundary once, kindly, then stop explaining.',
  'Do not shop to fix a feeling.',
  'If it’s a “maybe”, it’s a no.',
]

export default function Rules() {
  const { rules, saveTo, deleteFrom } = useApp()
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const reset = () => {
    setText('')
    setNote('')
    setEditing(null)
  }

  const submit = async () => {
    if (!text.trim()) return
    await saveTo('rules', {
      id: editing?.id || uid('rule'),
      type: 'rule',
      demo: editing?.demo || false,
      text: text.trim(),
      note: note.trim(),
      createdAt: editing?.createdAt,
    })
    reset()
  }

  const startEdit = (rule) => {
    setEditing(rule)
    setText(rule.text)
    setNote(rule.note || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <TopBar title="Personal Rules" subtitle="The promises you make to yourself" />

      <Card className="mb-5 space-y-4">
        <Field label={editing ? 'Edit rule' : 'New rule'}>
          <Input
            placeholder="e.g. Do not reply when angry."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <Field label="Why it matters (optional)">
          <Textarea
            rows={2}
            placeholder="A line to remind future-you of the reason."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" onClick={reset}>
              Cancel
            </Button>
          )}
          <Button className="flex-1" onClick={submit} disabled={!text.trim()}>
            <PlusIcon className="h-4 w-4" /> {editing ? 'Save changes' : 'Add rule'}
          </Button>
        </div>

        {!editing && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.filter((s) => !rules.some((r) => r.text === s)).slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="pill border border-white/[0.08] bg-white/[0.02] text-white/45 hover:text-white/75"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </Card>

      {rules.length === 0 ? (
        <EmptyState
          emoji="🧭"
          title="No rules yet"
          subtitle="Personal rules are the calm voice you set in advance — so heated moments don't decide for you."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {rules.map((rule) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="!p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xl">📌</span>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => startEdit(rule)} className="text-left">
                        <p className="font-serif text-lg leading-snug text-ivory-50">{rule.text}</p>
                        {rule.note && <p className="mt-1 text-sm text-white/45">{rule.note}</p>}
                      </button>
                    </div>
                    <button
                      onClick={() => setConfirmId(rule.id)}
                      className="shrink-0 text-white/30 hover:text-red-300"
                      aria-label="Delete rule"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <SafetyNote className="mt-5">
        Rules are personal reflections, not professional advice. If a decision involves your health, money, or
        safety, talk to a qualified person too.
      </SafetyNote>

      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => deleteFrom('rules', confirmId)}
        title="Delete this rule?"
        body="This removes the rule from this device. It can't be undone."
        confirmLabel="Delete"
      />
    </>
  )
}
