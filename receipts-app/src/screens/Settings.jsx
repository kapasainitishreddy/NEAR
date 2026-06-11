import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Button, Card, SafetyNote } from '../components/ui.jsx'
import { ConfirmModal } from '../components/Modal.jsx'
import { DownloadIcon, UploadIcon, TrashIcon, LockIcon } from '../components/icons.jsx'

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
  const fileRef = useRef(null)
  const [confirm, setConfirm] = useState(null) // 'clear' | 'reset' | 'demo'

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
        <Row title="Stored on this device" desc={`${total} item${total === 1 ? '' : 's'} total`}>
          <span className="pill bg-white/[0.05] text-white/55">{total}</span>
        </Row>
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
      <p className="px-1 text-center text-xs text-white/30">Receipts · local-first · v0.1.0</p>

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
    </>
  )
}
