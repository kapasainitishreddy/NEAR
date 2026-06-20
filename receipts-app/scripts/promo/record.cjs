/* eslint-disable */
// Records the promo composition to a WebM video via Playwright (no ffmpeg needed).
let chromium
try { ;({ chromium } = require('playwright')) }
catch { ;({ chromium } = require('/opt/node22/lib/node_modules/playwright/index.js')) }
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, '..', '..', 'promo')
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1080, height: 1920 } },
  })
  const page = await ctx.newPage()
  await page.goto('file://' + path.join(__dirname, 'promo.html'), { waitUntil: 'networkidle' })

  // Wait for the timeline to finish (window.__done) with a hard cap.
  await page.waitForFunction('window.__done === true', { timeout: 60000 }).catch(() => {})
  await page.waitForTimeout(500)

  const video = page.video()
  await ctx.close() // finalizes the recording
  await browser.close()

  const tmp = await video.path()
  const dest = path.join(OUT, 'receipts-promo.webm')
  fs.renameSync(tmp, dest)
  console.log('VIDEO:', dest, fs.statSync(dest).size, 'bytes')
})().catch((e) => { console.error(e); process.exit(1) })
