// ---------------------------------------------------------------------------
// App configuration. Fill in your RevenueCat API keys to enable purchases.
// Until keys are set, the app stays fully unlocked (no paywall bites), so the
// free/local-first experience is never broken before billing is wired up.
//
// Get keys from RevenueCat → Project Settings → API keys:
//   • Apple   → starts with "appl_"
//   • Google  → starts with "goog_"
//   • Web     → "Web Billing" public key, starts with "rcb_"
// ---------------------------------------------------------------------------
export const REVENUECAT = {
  appleApiKey: '',
  googleApiKey: '',
  webApiKey: '',
  // The entitlement identifier you create in RevenueCat (e.g. "pro").
  entitlementId: 'pro',
}

export function isPurchasesConfigured() {
  return Boolean(REVENUECAT.appleApiKey || REVENUECAT.googleApiKey || REVENUECAT.webApiKey)
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
