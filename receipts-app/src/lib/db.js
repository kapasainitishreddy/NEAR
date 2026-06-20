// ---------------------------------------------------------------------------
// Local-first storage. Everything lives on THIS device.
// We use localForage (IndexedDB with a localStorage fallback). Nothing here
// ever touches a network. There is no backend, no account, no telemetry.
// ---------------------------------------------------------------------------
import localforage from 'localforage'

localforage.config({
  name: 'receipts',
  storeName: 'receipts_store',
  description: 'Local-first storage for the Receipts app',
})

const KEYS = {
  scripts: 'scripts',
  decisions: 'decisions',
  rules: 'rules',
  settings: 'settings',
  meta: 'meta',
}

const DEFAULT_SETTINGS = {
  onboarded: false,
  demoLoaded: false,
  reduceMotion: false,
  name: '',
  theme: 'midnight',
}

async function read(key, fallback) {
  try {
    const value = await localforage.getItem(key)
    return value == null ? fallback : value
  } catch {
    return fallback
  }
}

async function write(key, value) {
  await localforage.setItem(key, value)
  return value
}

// ---- Collections (scripts / decisions / rules) ----------------------------

export async function getCollection(name) {
  return read(KEYS[name], [])
}

export async function saveCollection(name, items) {
  return write(KEYS[name], items)
}

export async function upsertItem(name, item) {
  const items = await getCollection(name)
  const now = new Date().toISOString()
  const idx = items.findIndex((i) => i.id === item.id)
  if (idx === -1) {
    const created = { ...item, createdAt: item.createdAt || now, updatedAt: now }
    return { items: [created, ...items], item: created }
  }
  const updated = { ...items[idx], ...item, updatedAt: now }
  const next = [...items]
  next[idx] = updated
  return { items: next, item: updated }
}

export function removeItem(items, id) {
  return items.filter((i) => i.id !== id)
}

// ---- Settings -------------------------------------------------------------

export async function getSettings() {
  const s = await read(KEYS.settings, {})
  return { ...DEFAULT_SETTINGS, ...s }
}

export async function saveSettings(settings) {
  return write(KEYS.settings, settings)
}

// ---- Export / Import / Wipe ----------------------------------------------

export async function exportAll() {
  const [scripts, decisions, rules, settings] = await Promise.all([
    getCollection('scripts'),
    getCollection('decisions'),
    getCollection('rules'),
    getSettings(),
  ])
  return {
    app: 'receipts',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { scripts, decisions, rules },
    settings: {
      onboarded: settings.onboarded,
      demoLoaded: settings.demoLoaded,
      reduceMotion: settings.reduceMotion,
      name: settings.name || '',
      theme: settings.theme || 'midnight',
    },
  }
}

export async function importAll(payload, { merge = true } = {}) {
  if (!payload || payload.app !== 'receipts' || !payload.data) {
    throw new Error('This file is not a valid Receipts export.')
  }
  const incoming = payload.data
  for (const name of ['scripts', 'decisions', 'rules']) {
    const next = Array.isArray(incoming[name]) ? incoming[name] : []
    if (!merge) {
      await saveCollection(name, next)
      continue
    }
    const existing = await getCollection(name)
    const byId = new Map(existing.map((i) => [i.id, i]))
    for (const item of next) byId.set(item.id, item)
    await saveCollection(name, Array.from(byId.values()))
  }
  return true
}

export async function clearAll() {
  await Promise.all([
    saveCollection('scripts', []),
    saveCollection('decisions', []),
    saveCollection('rules', []),
  ])
  const settings = await getSettings()
  await saveSettings({ ...settings, demoLoaded: false })
}

export async function wipeEverything() {
  await localforage.clear()
}

export { KEYS, DEFAULT_SETTINGS }
