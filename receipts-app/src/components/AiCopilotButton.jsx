import { useState } from 'react'
import { Button } from './ui.jsx'
import { useApp } from '../context/AppContext.jsx'
import { usePurchases } from '../context/PurchaseContext.jsx'
import { isAiConfigured } from '../lib/ai.js'

// A reusable "AI co-pilot" action. Gated by Pro; gracefully explains itself when
// AI isn't configured (so it's visible but never errors).
export default function AiCopilotButton({ label = '✨ AI co-pilot', run, onResult, className = '', variant = 'secondary' }) {
  const { showToast } = useApp()
  const { pro } = usePurchases()
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    if (!pro) {
      showToast('AI co-pilot is a Receipts Pro feature')
      return
    }
    if (!isAiConfigured()) {
      showToast('Add your AI endpoint in src/config.js to enable')
      return
    }
    setBusy(true)
    try {
      const out = await run()
      if (out) onResult(out)
      else showToast('No response from AI', 'error')
    } catch {
      showToast('AI request failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant={variant} className={className} onClick={onClick} disabled={busy}>
      {busy ? 'Thinking…' : label}
    </Button>
  )
}
