# Store submission checklist

Honest status: the **app is built and stable**, and the project is configured
(bundle id `com.kapasainitishreddy.receipts`, name "Receipts", icons, splash,
privacy manifest, signing scaffold). It is **not yet submittable** — the items
below need real accounts, signing assets, store listings, and live IAP. None of
these can live in the repo alone.

## ✅ Already done (in repo)
- Capacitor app id, name, splash, background color.
- App icons (Android mipmaps; iOS 1024 asset).
- `PRIVACY.md` (privacy policy text — must be **hosted at a URL** for the stores).
- iOS `PrivacyInfo.xcprivacy` + `ITSAppUsesNonExemptEncryption=false` + mic/speech
  usage strings.
- Android `targetSdk/compileSdk = 35` (Play requirement) and a **release signing
  config** that reads `android/keystore.properties` (see `.example`).
- RevenueCat payments integrated (keys not set → app stays fully unlocked).

## 🔲 Apple App Store
1. **Apple Developer Program** membership ($99/yr).
2. In Xcode: select your **Team**, set signing (automatic), set
   `MARKETING_VERSION` (1.0) and `CURRENT_PROJECT_VERSION` (1).
3. Add `PrivacyInfo.xcprivacy` to the **App target** (Xcode → file → Target
   Membership) so it ships in the bundle.
4. **App Store Connect**: create the app, fill description, keywords, support URL,
   marketing URL, **privacy policy URL**, age rating, and **App Privacy** answers
   (collects nothing → easy).
5. **Screenshots** for required device sizes (6.7", 6.5", 5.5", iPad if you keep
   iPad support). Reuse `screenshots/` as a base.
6. **In-app purchase**: create the IAP product in App Store Connect, accept the
   Paid Apps agreement (tax/banking), map it in RevenueCat, paste keys into
   `src/config.js`. Apple **rejects non-functional paywalls** — either wire IAP
   fully or hide the paywall for v1 (see note below).
7. Archive in Xcode → upload → submit for review.

## 🔲 Google Play
1. **Play Developer** account ($25 one-time).
2. **Upload keystore**: `keytool -genkey -v -keystore upload-keystore.jks
   -keyalg RSA -keysize 2048 -validity 10000 -alias upload`, then create
   `android/keystore.properties` from the example. Enroll in **Play App Signing**.
3. Build the bundle: `npm run build && npx cap sync android` then in Android
   Studio **Build → Generate Signed Bundle (AAB)** (or `./gradlew bundleRelease`).
4. **Play Console**: create the app, store listing (short/full description,
   **feature graphic 1024×500**, screenshots, icon 512×512), content rating
   questionnaire, target audience, **Data safety** form (collects nothing),
   and the **hosted privacy policy URL**.
5. **In-app product**: create it in Play Console, map in RevenueCat, paste keys.
6. Upload AAB to a testing track → promote to production.

## ⚠️ Decisions to make before v1
- **Paywall vs. IAP**: today the paywall shows "billing not configured" and can't
  purchase. For v1 either (a) fully configure RevenueCat + store products, or
  (b) hide the "Receipts Pro" entry so reviewers don't see a dead paywall.
- **Native voice limits**: the **dictation** mic uses the Web Speech *recognition*
  API, which isn't available in iOS WKWebView / Android System WebView — it
  hides itself there, so it simply won't appear on device (not a blocker).
  **Listen / text-to-speech** works on iOS; on Android WebView TTS support is
  limited — test on a device and hide if unsupported.
- **Device testing**: run on a real iPhone + Android phone before submitting.

## Quick commands
```bash
cd receipts-app
npm run build && npx cap sync          # sync web → native
npx cap open ios                       # Xcode: archive & upload
npx cap open android                   # Android Studio: signed AAB
```
