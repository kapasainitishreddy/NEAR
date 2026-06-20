import { useState, useEffect } from 'react'
import Modal from './Modal.jsx'
import { Button, Textarea } from './ui.jsx'
import { OUTCOMES } from '../lib/constants.js'

// Records how a decision turned out: the heart of the calibration score.
export default function OutcomeModal({ open, onClose, item, onSave }) {
  const [choice, setChoice] = useState(item?.outcome || null)
  const [note, setNote] = useState(item?.outcomeNote || '')

  useEffect(() => {
    if (open) {
      setChoice(item?.outcome || null)
      setNote(item?.outcomeNote || '')
    }
  }, [open, item])

  const save = () => {
    if (!choice) return
    onSave({ outcome: choice, outcomeNote: note.trim(), outcomeAt: new Date().toISOString() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How did this turn out?"
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Later
          </Button>
          <Button className="flex-1" onClick={save} disabled={!choice}>
            Save outcome
          </Button>
        </>
      }
    >
      <p className="mb-4 text-white/55">Looking back, how do you feel about this decision now?</p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.id}
            onClick={() => setChoice(o.id)}
            className={`rounded-2xl border px-2 py-3 text-center transition ${
              choice === o.id
                ? 'border-gold-400/50 bg-gold-400/10'
                : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
            aria-pressed={choice === o.id}
          >
            <div className="text-2xl">{o.emoji}</div>
            <div className="mt-1 text-sm font-medium text-ivory-50">{o.label}</div>
          </button>
        ))}
      </div>
      <Textarea
        rows={2}
        placeholder="Anything you learned? (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </Modal>
  )
}
