# Store builds — Android (Play) & iOS (App Store)

Receipts is a web app wrapped with **[Capacitor](https://capacitorjs.com/)**, so
the same code ships as a PWA *and* as native Android/iOS apps. This guide covers
producing the signed artifacts (`.aab` / `.ipa`) and the store-listing checklist.

- **App ID / bundle ID:** `com.kapasainitishreddy.receipts`
- **App name:** Receipts

> ⚠️ The native projects (`android/`, `ios/`) are scaffolded and configured, but
> the **final compile must happen on your machine** with the platform tooling:
> Android needs **Android Studio + SDK**; iOS needs **macOS + Xcode** (Apple does
> not allow iOS builds on Linux/Windows).

---

## Build without Android Studio / without a local Mac (cloud CI)

You do **not** need to install Android Studio or own a Mac. Two GitHub Actions
workflows build the apps in the cloud:

- **`.github/workflows/android-build.yml`** — runs on a Linux runner that already
  has the Android SDK.
  - Every push produces a **debug APK** as a downloadable artifact (Actions tab →
    run → Artifacts → `receipts-debug-apk`). Install it on any Android phone to
    test — no secrets needed.
  - Add four repo secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
    `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) and it also builds a **signed
    `.aab`** ready for Play. Steps to create the keystore are in the workflow file.
- **`.github/workflows/ios-build.yml`** — runs on a macOS runner; compiles the iOS
  app (unsigned) to prove it builds. A submittable `.ipa` still needs Apple
  signing assets as secrets (see §2).

> ### "Can I just use Expo / EAS Build?"
> Not as a drop-in. **Expo builds React Native apps** (native components), while
> Receipts is a **web app** (HTML/CSS/Tailwind/DOM) wrapped with Capacitor.
> Moving to Expo would mean rewriting the entire UI in React Native and dropping
> the PWA. The cloud CI above gives you the same "no local IDE" benefit without a
> rewrite.
>
> **Simplest no-CLI option for Android:** host the PWA (Netlify/Vercel/GitHub
> Pages) and feed the URL to **[PWABuilder](https://www.pwabuilder.com/)** — it
> generates a signed Play `.aab` (TWA) entirely in the browser.

---

## 0. One-time setup

```bash
npm install
npm run build        # builds the web app into dist/
npm run assets       # regenerates app icons + splash screens (optional)
npx cap sync         # copies web build + plugins into android/ and ios/
```

`npm run build:native` runs `vite build` + `cap sync` in one step.

---

## 1. Android → Google Play (`.aab`)

### Build
```bash
npm run build:native
npx cap open android        # opens Android Studio
```
In Android Studio:
1. Let Gradle sync (first run downloads the SDK/build tools).
2. **Build → Generate Signed Bundle / APK → Android App Bundle**.
3. Create or select an **upload keystore** (keep it safe — losing it means you
   can't update the app). Or use Play App Signing.
4. Output: `android/app/release/app-release.aab`.

CLI alternative (after configuring signing in `android/app/build.gradle`):
```bash
cd android && ./gradlew bundleRelease
```

### Play Console checklist
- [ ] `targetSdkVersion` meets Play's current requirement (Android 14 / API 34+; check Capacitor's `android/variables.gradle`)
- [ ] App icon (provided), feature graphic **1024×500**, 2–8 phone screenshots
- [ ] Short + full description, category
- [ ] **Privacy Policy URL** (host `PRIVACY.md` — e.g. GitHub Pages)
- [ ] **Data safety** form → "No data collected / shared" (all data is on-device)
- [ ] Content rating questionnaire
- [ ] $25 one-time developer registration

---

## 2. iOS → App Store (`.ipa`)  *(requires macOS + Xcode)*

### Build
```bash
npm run build:native
npx cap open ios            # opens Xcode
```
In Xcode:
1. Select the **App** target → **Signing & Capabilities** → choose your Team
   (automatic signing). Bundle ID is already `com.kapasainitishreddy.receipts`.
2. Set a real **version** and **build** number.
3. **Product → Archive**, then **Distribute App → App Store Connect**.

> First time on a fresh checkout, install CocoaPods deps: `cd ios/App && pod install`.

### App Store Connect checklist
- [ ] Apple Developer Program membership ($99/yr)
- [ ] App icon (provided), screenshots for required device sizes
- [ ] **Privacy Policy URL** + **App Privacy** "nutrition label" → "Data Not Collected"
- [ ] Description, keywords, support URL
- [ ] ⚠️ **Guideline 4.2 (Minimum Functionality):** Apple can reject apps that are
      just a website in a webview. Receipts ships real on-device functionality
      (local storage, generators, offline use) which helps — but consider adding
      a native touch (e.g. share sheet, haptics, local notifications for reviews)
      if review pushes back.

---

## 3. Regenerating icons & splash

Source art is generated programmatically (no binaries to hand-edit):
```bash
npm run assets   # writes assets/icon.png + assets/splash*.png, then injects them
```
To tweak the look, edit `scripts/gen-native-assets.mjs`.

## 4. Updating the app

After any web change:
```bash
npm run build:native     # rebuild web + cap sync
```
then re-archive / re-bundle in Xcode / Android Studio and upload a new build.
