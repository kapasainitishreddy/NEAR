// ---------------------------------------------------------------------------
// App configuration. Replace the RevenueCat placeholders below with your real
// keys to enable purchases.
//
// The placeholders (the "X…" values) are detected and treated as *not
// configured*, so the app stays fully unlocked and throws no errors until you
// paste real keys in. Get them from RevenueCat → Project Settings → API keys:
//   • Apple   → starts with "appl_"
//   • Google  → starts with "goog_"
//   • Web     → "Web Billing" public key, starts with "rcb_"
// ---------------------------------------------------------------------------
export const REVENUECAT = {
  // --- Public API keys (replace the placeholders) ---
  appleApiKey: 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  googleApiKey: 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  webApiKey: 'rcb_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',

  // --- Entitlement + offering identifiers (match your RevenueCat dashboard) ---
  entitlementId: 'pro',
  offeringId: 'default',

  // --- Store product identifiers (for reference; create these in the stores) ---
  products: {
    monthly: 'receipts_pro_monthly',
    annual: 'receipts_pro_annual',
    lifetime: 'receipts_pro_lifetime',
  },
}

// A value still containing the placeholder pattern (e.g. "appl_XXXX…") is not a
// real key.
const PLACEHOLDER = /X{4,}|YOUR_|REPLACE_ME/i
export function isRealKey(key) {
  return typeof key === 'string' && key.trim() !== '' && !PLACEHOLDER.test(key)
}

// The valid key for the current platform, or '' if it's still a placeholder.
export function resolvedApiKey(platform) {
  const key =
    platform === 'ios'
      ? REVENUECAT.appleApiKey
      : platform === 'android'
        ? REVENUECAT.googleApiKey
        : REVENUECAT.webApiKey
  return isRealKey(key) ? key : ''
}

export function isPurchasesConfigured() {
  return (
    isRealKey(REVENUECAT.appleApiKey) ||
    isRealKey(REVENUECAT.googleApiKey) ||
    isRealKey(REVENUECAT.webApiKey)
  )
}

// ---------------------------------------------------------------------------
// AI Co-pilot (optional, Pro). Point `endpoint` at YOUR backend proxy that
// forwards the prompt to an LLM (Claude/OpenAI/etc.) — never ship a provider key
// in the client. Left empty = AI features stay off (no errors, nothing shown).
// The proxy should accept { prompt, system, model } and return { text }.
// ---------------------------------------------------------------------------
export const AI = {
  endpoint: '', // e.g. 'https://your-worker.example.com/ai'
  model: 'claude-haiku-4-5',
}

export function isAiConfigured() {
  return typeof AI.endpoint === 'string' && /^https?:\/\//.test(AI.endpoint)
}

// Marketing copy for the paywall — shown regardless of configuration.
export const PRO_BENEFITS = [
  { emoji: '🎨', title: 'Every theme', body: 'Unlock Obsidian, Sepia & Forest palettes.' },
  { emoji: '📊', title: 'Insights', body: 'Calibration score, patterns & your emotional trend.' },
  { emoji: '📖', title: 'Operating Manual', body: 'Export your rules & principles as a poster.' },
  { emoji: '🔒', title: 'App lock', body: 'Protect your private space with a PIN.' },
  { emoji: '▦', title: 'Decision matrix', body: 'Weighted scoring to find the clear winner.' },
  { emoji: '💜', title: 'Support a tiny app', body: 'Help keep Receipts independent and ad-free.' },
]
