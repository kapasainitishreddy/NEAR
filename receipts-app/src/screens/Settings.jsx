import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { usePurchases } from '../context/PurchaseContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, Chip, Field, Input, SafetyNote } from '../components/ui.jsx'
import { ConfirmModal } from '../components/Modal.jsx'
import { DownloadIcon, UploadIcon, TrashIcon, LockIcon, CheckIcon, ShareIcon, SpeakerIcon } from '../components/icons.jsx'
import { THEMES, VALUE_SUGGESTIONS } from '../lib/constants.js'
import PinSetupModal from '../components/PinSetupModal.jsx'
import OperatingManualModal from '../components/OperatingManualModal.jsx'
import Paywall from '../components/Paywall.jsx'
import { loadVoices, speak, speechSupported } from '../lib/speech.js'

function ThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative overflow-hidden rounded-2xl border p-3 text-left transition ${
              active ? 'border-gold-400/50' : 'border-white/[0.08] hover:border-white/20'
            }`}
            style={{ background: t.bg }}
            aria-label={`${t.label} theme`}
            aria-pressed={active}
          >
            {/* miniature canvas preview */}
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                backgroundImage: `radial-gradient(120px 70px at 80% -10%, ${t.glow}33, transparent 60%)`,
              }}
            />
            <div className="relative flex items-center gap-2">
              <span
                className="h-7 w-7 rounded-lg shadow-inner"
                style={{ background: t.surface, border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <span className="h-7 w-7 rounded-full" style={{ background: t.accent }} />
              {active && (
                <motion.span
                  layoutId="themeCheck"
                  className="ml-auto grid h-6 w-6 place-items-center rounded-full"
                  style={{ background: t.accent, color: t.bg }}
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </motion.span>
              )}
            </div>
            <div className="relative mt-3 font-serif text-base" style={{ color: '#f5f2e9' }}>
              {t.label}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="font-medium text-ivory-50">{title}</div>
        {desc && <div className="text-sm text-white/45">{desc}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const {
    settings,
    updateSettings,
    scripts,
    decisions,
    rules,
    exportData,
    importData,
    loadDemo,
    removeDemo,
    clearEverything,
    factoryReset,
    showToast,
  } = useApp()
  const { pro, configured } = usePurchases()
  const fileRef = useRef(null)
  const [confirm, setConfirm] = useState(null) // 'clear' | 'reset' | 'demo'
  const [pinOpen, setPinOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [voices, setVoices] = useState([])

  useEffect(() => {
    if (speechSupported()) loadVoices().then(setVoices)
  }, [])

  const coreValues = settings.values || []
  const addValue = (v) => {
    const val = v.trim()
    if (!val || coreValues.includes(val)) return
    updateSettings({ values: [...coreValues, val].slice(0, 12) })
    setNewValue('')
  }
  const removeValue = (v) => updateSettings({ values: coreValues.filter((x) => x !== v) })

  const toggleLock = () => {
    if (settings.lockEnabled) {
      updateSettings({ lockEnabled: false, pinHash: '' })
      showToast('App lock turned off')
    } else {
      setPinOpen(true)
    }
  }

  const hasDemo = [...scripts, ...decisions, ...rules].some((i) => i.demo)
  const total = scripts.length + decisions.length + rules.length

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      await importData(payload, { merge: true })
    } catch (err) {
      showToast(err.message || 'Could not import this file', 'error')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <>
      <TopBar title="Settings" subtitle="Privacy & your data" onSettings={false} back />

      {/* Privacy hero */}
      <Card className="mb-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <LockIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-ivory-50">This device only</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              Your scripts, decisions, notes, and reviews stay on this device. Nothing is uploaded unless you
              export it yourself.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          {[
            ['No backend', '🚫'],
            ['No login', '🔓'],
            ['No tracking', '👁️'],
            ['No cloud DB', '☁️'],
          ].map(([t, e]) => (
            <div key={t} className="rounded-xl bg-white/[0.03] py-2">
              <div className="text-base">{e}</div>
              <div className="text-white/55">{t}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Receipts Pro */}
      <button
        onClick={() => setPaywallOpen(true)}
        className="card group relative mb-5 w-full overflow-hidden !p-5 text-left"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-gold-300 to-gold-500 text-xl text-navy-950">
            ✦
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg text-ivory-50">Receipts Pro</h2>
              {pro && <span className="pill bg-emerald-500/15 text-emerald-300">Active</span>}
            </div>
            <p className="text-sm text-white/55">
              {pro ? 'Thanks for supporting Receipts 💜' : 'Unlock themes, insights, app lock & more.'}
            </p>
          </div>
          {!pro && <span className="text-gold-300">→</span>}
        </div>
      </button>

      {/* Appearance */}
      <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Appearance</h2>
      <Card className="mb-5">
        <ThemePicker value={settings.theme} onChange={(theme) => updateSettings({ theme })} />
        <p className="mt-3 px-1 text-xs text-white/40">
          Themes change the whole app instantly. Your choice stays on this device.
        </p>
      </Card>

      {/* Personalize */}
      <Card className="mb-5 space-y-4">
        <Field label="Your name (optional)" hint="Used only to greet you on the Home screen. Never leaves this device.">
          <Input
            value={settings.name || ''}
            onChange={(e) => updateSettings({ name: e.target.value.slice(0, 40) })}
            placeholder="What should we call you?"
            autoComplete="off"
          />
        </Field>

        {/* Values compass */}
        <div>
          <div className="label-base">Your core values 🧭</div>
          <p className="-mt-0.5 mb-2 text-xs text-white/40">
            Tag decisions with the values they honor or cost.
          </p>
          {coreValues.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {coreValues.map((v) => (
                <button
                  key={v}
                  onClick={() => removeValue(v)}
                  className="pill bg-emerald-500/15 text-emerald-300"
                >
                  {v} ✕
                </button>
              ))}
            </div>
          )}
          <div className="mb-2 flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addValue(newValue)}
              placeholder="Add a value…"
            />
            <Button variant="secondary" onClick={() => addValue(newValue)} disabled={!newValue.trim()}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {VALUE_SUGGESTIONS.filter((v) => !coreValues.includes(v)).slice(0, 6).map((v) => (
              <Chip key={v} onClick={() => addValue(v)}>
                + {v}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      {/* Voice */}
      {speechSupported() && (
        <>
          <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Voice</h2>
          <Card className="mb-5 space-y-4">
            <p className="-mb-1 text-sm text-white/45">
              Hear your scripts and receipts read aloud — synthesised on-device, nothing uploaded.
            </p>
            <Field label="Voice">
              <select
                className="input-base appearance-none pr-10"
                value={settings.speechVoice || ''}
                onChange={(e) => updateSettings({ speechVoice: e.target.value })}
              >
                <option value="">Default ({voices[0]?.name || 'system'})</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} {v.lang ? `· ${v.lang}` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <div className="label-base">Speed · {(settings.speechRate || 1).toFixed(1)}×</div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={settings.speechRate || 1}
                onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
                className="w-full accent-gold-400"
              />
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                speak('This is how your scripts will sound when read aloud.', {
                  voiceURI: settings.speechVoice,
                  rate: settings.speechRate || 1,
                })
              }
            >
              <SpeakerIcon className="h-5 w-5" /> Preview voice
            </Button>
          </Card>
        </>
      )}

      {/* Preferences */}
      <Card className="mb-5 divide-y divide-white/[0.06] !py-1">
        <Row title="Reduce motion" desc="Calmer, minimal animations">
          <button
            onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
            className={`relative h-7 w-12 rounded-full transition ${
              settings.reduceMotion ? 'bg-emerald-500/70' : 'bg-white/15'
            }`}
            aria-label="Toggle reduce motion"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                settings.reduceMotion ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </Row>
        <Row title="App lock" desc={settings.lockEnabled ? 'PIN required to open' : 'Require a PIN to open'}>
          <button
            onClick={toggleLock}
            className={`relative h-7 w-12 rounded-full transition ${
              settings.lockEnabled ? 'bg-emerald-500/70' : 'bg-white/15'
            }`}
            aria-label="Toggle app lock"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                settings.lockEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </Row>
        <Row title="Stored on this device" desc={`${total} item${total === 1 ? '' : 's'} total`}>
          <span className="pill bg-white/[0.05] text-white/55">{total}</span>
        </Row>
      </Card>

      {/* Keepsakes */}
      <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Keepsakes</h2>
      <Card className="mb-5">
        <Button variant="secondary" className="w-full justify-start" onClick={() => setManualOpen(true)}>
          <ShareIcon className="h-5 w-5" /> Create my Operating Manual
        </Button>
        <p className="mt-2 px-1 text-xs text-white/40">
          A beautiful one-page poster of your rules and guiding principles.
        </p>
      </Card>

      {/* Data management */}
      <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Your data</h2>
      <Card className="mb-5 space-y-3">
        <Button variant="secondary" className="w-full justify-start" onClick={exportData}>
          <DownloadIcon className="h-5 w-5" /> Export a backup (.json)
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon className="h-5 w-5" /> Import from backup
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
        <p className="px-1 text-xs text-white/40">
          Exporting creates a file you control. Importing merges items into what's already here.
        </p>
      </Card>

      {/* Demo data */}
      <h2 className="mb-3 px-1 font-serif text-lg text-ivory-50">Sample data</h2>
      <Card className="mb-5">
        {hasDemo ? (
          <Button variant="ghost" className="w-full justify-start" onClick={() => setConfirm('demo')}>
            <TrashIcon className="h-5 w-5" /> Remove sample data
          </Button>
        ) : (
          <Button variant="ghost" className="w-full justify-start" onClick={loadDemo}>
            ✨ Load sample data
          </Button>
        )}
      </Card>

      {/* Danger zone */}
      <h2 className="mb-3 px-1 font-serif text-lg text-red-300/90">Danger zone</h2>
      <Card className="mb-5 space-y-3">
        <Button variant="danger" className="w-full justify-start" onClick={() => setConfirm('clear')}>
          <TrashIcon className="h-5 w-5" /> Clear all entries
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-300/80" onClick={() => setConfirm('reset')}>
          Reset app completely
        </Button>
        <p className="px-1 text-xs text-white/40">
          Clearing removes scripts, receipts and rules. Reset also clears settings and replays onboarding.
        </p>
      </Card>

      <SafetyNote className="mb-2">
        This is a writing and reflection tool, not legal, medical, financial, or therapy advice. Review before
        sending or acting.
      </SafetyNote>
      <p className="px-1 text-center text-xs text-white/30">
        Receipts · local-first · v{__APP_VERSION__}
      </p>

      <ConfirmModal
        open={confirm === 'demo'}
        onClose={() => setConfirm(null)}
        onConfirm={removeDemo}
        title="Remove sample data?"
        body="This deletes only the built-in demo items. Anything you created stays."
        confirmLabel="Remove demo"
      />
      <ConfirmModal
        open={confirm === 'clear'}
        onClose={() => setConfirm(null)}
        onConfirm={clearEverything}
        title="Clear all entries?"
        body="This permanently deletes every script, receipt and rule on this device. This cannot be undone — consider exporting a backup first."
        confirmLabel="Clear everything"
      />
      <ConfirmModal
        open={confirm === 'reset'}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          await factoryReset()
          window.location.hash = '#/onboarding'
        }}
        title="Reset the whole app?"
        body="Deletes all data and settings, then restarts onboarding. This cannot be undone."
        confirmLabel="Reset app"
      />

      <PinSetupModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onComplete={(pinHash) => {
          updateSettings({ lockEnabled: true, pinHash })
          showToast('App lock enabled')
        }}
      />
      <OperatingManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
      <Paywall open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  )
}
