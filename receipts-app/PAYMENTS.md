# Payments — Receipts Pro (RevenueCat)

Receipts ships with a complete **RevenueCat** integration for a one-tap "Pro"
upgrade. Until you add API keys the app stays **fully unlocked**, so nothing is
crippled before you're ready to monetise.

## How it works

- **`src/config.js`** — ships with **placeholder** keys (the `X…` values). They
  are auto-detected as "not real", so the app stays fully unlocked with no errors
  until you replace them with your actual RevenueCat keys.
- **`src/lib/purchases.js`** — adapter that normalises the native (Capacitor)
  and web SDKs behind one interface (lazy-loaded).
- **`src/context/PurchaseContext.jsx`** — exposes `{ pro, packages, buy, restore,
  configured }`. When no keys are set, `pro` defaults to `true` (everything open).
- **`src/components/Paywall.jsx`** — the upgrade screen (Settings → Receipts Pro).

The RevenueCat **web** SDK is code-split into its own chunk and only loaded when
billing is configured, so it never bloats the default bundle.

## Setup (one time)

1. Create a free account at [revenuecat.com](https://www.revenuecat.com/) and a
   new **Project**.
2. Add your apps:
   - **App Store** → create the in-app purchase / subscription in App Store
     Connect, then add the app in RevenueCat.
   - **Play Store** → create the product in Play Console, then add the app.
   - **Web** (optional) → enable **Web Billing** (Stripe) in RevenueCat.
3. Create an **Entitlement** (e.g. `pro`) and attach your products to an
   **Offering** (RevenueCat → Offerings).
4. Copy the public API keys into **`src/config.js`**:
   ```js
   export const REVENUECAT = {
     appleApiKey: 'appl_xxx',
     googleApiKey: 'goog_xxx',
     webApiKey: 'rcb_xxx',   // Web Billing public key
     entitlementId: 'pro',
   }
   ```
5. Rebuild: `npm run build:native` (then the native projects pick up the plugin
   via `cap sync`, already wired).

That's it — the paywall will show your real packages and prices, purchases grant
the `pro` entitlement, and the gated features unlock automatically.

## What's Pro

Configured in `src/config.js → PRO_BENEFITS` and gated in the UI: extra themes,
Insights, the Operating Manual export, App Lock, and the Decision Matrix. Core
writing (scripts, receipts, rules, library) is always free.

> Native store note: physical builds must declare IAP capabilities. iOS needs the
> In-App Purchase capability (automatic with the product); Android needs the
> `com.android.vending.BILLING` permission (added by the RevenueCat plugin).
