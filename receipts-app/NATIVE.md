# Native integrations (iOS/Android)

Most of Receipts runs from one web build. A few platform features need native
project work in Xcode/Android Studio and **can't be built or tested headlessly**,
so they're documented here rather than shipped half-done. Each is optional — the
app already ships a working in-app equivalent.

## Already wired (work today)
- **Local reminders** — `@capacitor/local-notifications`, scheduled on save,
  toggle in Settings.
- **Deep links** — `receipts://new | script | insights` (URL scheme registered
  for both platforms; handled in `src/native.js`). Siri Shortcuts can call these
  via the "Open URL" action.
- **Share sheet** — `@capacitor/share` for advice/accountability/invite.

## 1. Apple Health — sleep → "rested" (optional)
Today users tap a 1–5 "how rested are you?" field, and Insights correlates rest
with regret. To auto-fill it from HealthKit:

1. `npm i @perfood/capacitor-healthkit` (or `cordova-plugin-health`).
2. Xcode → target → Signing & Capabilities → **+ HealthKit**.
3. Add `NSHealthShareUsageDescription` to `Info.plist`.
4. Read the most recent `sleepAnalysis` sample and map hours → 1–5, then set the
   `rested` field. Wrap in `Capacitor.isNativePlatform()` so the web build is
   unaffected.

> Not auto-installed: an untested native plugin could break the iOS build. The
> manual field already powers the insight.

## 2. Home-screen widget (optional)
A true widget needs a native extension target (not a Capacitor webview):

- **iOS**: add a **Widget Extension** target in Xcode (WidgetKit/SwiftUI). Share
  data via an App Group + `UserDefaults(suiteName:)`; write the daily prompt /
  next-review there from the app.
- **Android**: add an **App Widget** (`AppWidgetProvider` + RemoteViews).

The in-app **"Today" card** (daily prompt) and **decide-by list** on Home cover
the same need inside the app until then.

## 3. Siri "Hey Siri, log a decision" (optional, beyond URL scheme)
The deep link already lets a user-made Shortcut open `receipts://new`. For a
native voice phrase without a manual Shortcut, add **App Intents** (`AppIntent` +
`AppShortcutsProvider`) in Xcode and donate a "New decision" intent.
