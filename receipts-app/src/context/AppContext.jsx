import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearAll,
  exportAll,
  getCollection,
  getSettings,
  importAll,
  removeItem,
  saveCollection,
  saveSettings,
  upsertItem,
  wipeEverything,
} from '../lib/db.js'
import {
  buildSampleDecisions,
  buildSampleRules,
  buildSampleScripts,
} from '../lib/sampleData.js'
import { tapSuccess, tapWarning } from '../lib/haptics.js'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [scripts, setScripts] = useState([])
  const [decisions, setDecisions] = useState([])
  const [rules, setRules] = useState([])
  const [settings, setSettings] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // ---- Initial load -------------------------------------------------------
  useEffect(() => {
    let active = true
    ;(async () => {
      const [s, d, r, cfg] = await Promise.all([
        getCollection('scripts'),
        getCollection('decisions'),
        getCollection('rules'),
        getSettings(),
      ])
      if (!active) return
      setScripts(s)
      setDecisions(d)
      setRules(r)
      setSettings(cfg)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

  // ---- Reduced motion -----------------------------------------------------
  // Mirror the preference onto <html> so plain CSS transitions/animations are
  // dampened too (Framer Motion is handled separately via <MotionConfig>).
  useEffect(() => {
    if (!settings) return
    document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion)
  }, [settings])

  // ---- Toast --------------------------------------------------------------
  const showToast = useCallback((message, kind = 'success') => {
    setToast({ message, kind, id: Date.now() })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
    // Pair every bit of feedback with a matching haptic (no-op on the web).
    if (kind === 'error') tapWarning()
    else tapSuccess()
  }, [])

  // ---- Settings -----------------------------------------------------------
  const updateSettings = useCallback(
    async (patch) => {
      const next = { ...settings, ...patch }
      setSettings(next)
      await saveSettings(next)
      return next
    },
    [settings]
  )

  // ---- Generic collection helpers ----------------------------------------
  const collections = useMemo(
    () => ({
      scripts: { items: scripts, set: setScripts },
      decisions: { items: decisions, set: setDecisions },
      rules: { items: rules, set: setRules },
    }),
    [scripts, decisions, rules]
  )

  const saveTo = useCallback(async (name, item) => {
    const { items, item: saved } = await upsertItem(name, item)
    await saveCollection(name, items)
    if (name === 'scripts') setScripts(items)
    else if (name === 'decisions') setDecisions(items)
    else if (name === 'rules') setRules(items)
    return saved
  }, [])

  const deleteFrom = useCallback(
    async (name, id) => {
      const current = collections[name].items
      const next = removeItem(current, id)
      await saveCollection(name, next)
      collections[name].set(next)
    },
    [collections]
  )

  // ---- Demo data ----------------------------------------------------------
  const loadDemo = useCallback(async () => {
    const s = [...buildSampleScripts(), ...scripts.filter((x) => !x.demo)]
    const d = [...buildSampleDecisions(), ...decisions.filter((x) => !x.demo)]
    const r = [...buildSampleRules(), ...rules.filter((x) => !x.demo)]
    await Promise.all([
      saveCollection('scripts', s),
      saveCollection('decisions', d),
      saveCollection('rules', r),
    ])
    setScripts(s)
    setDecisions(d)
    setRules(r)
    await updateSettings({ demoLoaded: true })
    showToast('Demo data added')
  }, [scripts, decisions, rules, updateSettings, showToast])

  const removeDemo = useCallback(async () => {
    const s = scripts.filter((x) => !x.demo)
    const d = decisions.filter((x) => !x.demo)
    const r = rules.filter((x) => !x.demo)
    await Promise.all([
      saveCollection('scripts', s),
      saveCollection('decisions', d),
      saveCollection('rules', r),
    ])
    setScripts(s)
    setDecisions(d)
    setRules(r)
    await updateSettings({ demoLoaded: false })
    showToast('Demo data removed')
  }, [scripts, decisions, rules, updateSettings, showToast])

  // ---- Export / Import / Clear -------------------------------------------
  const exportData = useCallback(async () => {
    const payload = await exportAll()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `receipts-backup-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded')
  }, [showToast])

  const importData = useCallback(
    async (payload, opts) => {
      await importAll(payload, opts)
      const [s, d, r] = await Promise.all([
        getCollection('scripts'),
        getCollection('decisions'),
        getCollection('rules'),
      ])
      setScripts(s)
      setDecisions(d)
      setRules(r)
      showToast('Data imported')
    },
    [showToast]
  )

  const clearEverything = useCallback(async () => {
    await clearAll()
    setScripts([])
    setDecisions([])
    setRules([])
    await updateSettings({ demoLoaded: false })
    showToast('All entries cleared')
  }, [updateSettings, showToast])

  const factoryReset = useCallback(async () => {
    await wipeEverything()
    setScripts([])
    setDecisions([])
    setRules([])
    setSettings({ onboarded: false, demoLoaded: false, reduceMotion: false, name: '' })
  }, [])

  const value = useMemo(
    () => ({
      loading,
      scripts,
      decisions,
      rules,
      settings: settings || { onboarded: false, demoLoaded: false, reduceMotion: false, name: '' },
      toast,
      showToast,
      updateSettings,
      saveTo,
      deleteFrom,
      loadDemo,
      removeDemo,
      exportData,
      importData,
      clearEverything,
      factoryReset,
    }),
    [
      loading,
      scripts,
      decisions,
      rules,
      settings,
      toast,
      showToast,
      updateSettings,
      saveTo,
      deleteFrom,
      loadDemo,
      removeDemo,
      exportData,
      importData,
      clearEverything,
      factoryReset,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
