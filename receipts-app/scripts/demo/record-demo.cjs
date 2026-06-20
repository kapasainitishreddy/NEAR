/* eslint-disable */
// Records a "how to use" demo by driving the LIVE app with real interactions
// and on-screen caption overlays. Output: demo/receipts-demo.webm
// A preview server must be running on BASE.
let chromium
try { ;({ chromium } = require('playwright')) }
catch { ;({ chromium } = require('/opt/node22/lib/node_modules/playwright/index.js')) }
const path = require('path')
const fs = require('fs')
const seed = require('../seedshared.cjs')

const BASE = process.env.BASE || 'http://localhost:4327'
const OUT = path.join(__dirname, '..', '..', 'demo')
fs.mkdirSync(OUT, { recursive: true })

const W = 460, H = 1000

async function caption(page, step, text) {
  await page.evaluate(
    ({ step, text }) => {
      let el = document.getElementById('__demo_cap')
      if (!el) {
        el = document.createElement('div')
        el.id = '__demo_cap'
        el.style.cssText =
          'position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:18px 22px calc(env(safe-area-inset-bottom) + 22px);' +
          'background:linear-gradient(0deg, rgba(10,15,29,.96), rgba(10,15,29,.7) 70%, transparent);' +
          'font-family:Inter,system-ui,sans-serif;color:#f5f2e9;transition:opacity .4s ease;pointer-events:none;'
        document.body.appendChild(el)
      }
      el.style.opacity = '0'
      setTimeout(() => {
        el.innerHTML =
          '<div style="font:600 12px/1 ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:#e7cd8f;margin-bottom:8px">' +
          step +
          '</div><div style="font:600 22px/1.3 Newsreader,Georgia,serif">' +
          text +
          '</div>'
        el.style.opacity = '1'
      }, 180)
    },
    { step, text }
  )
}
const sleep = (page, ms) => page.waitForTimeout(ms)
async function go(page, hash, ms = 1100) {
  await page.evaluate((h) => (location.hash = h), hash)
  await sleep(page, ms)
}
async function softScroll(page, px = 500, steps = 8) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps)
    await sleep(page, 110)
  }
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  })
  const page = await ctx.newPage()

  // Seed rich data so every screen is full, then load the app.
  await page.goto(BASE + '/#/onboarding', { waitUntil: 'networkidle' })
  await sleep(page, 600)
  await seed(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await sleep(page, 1400)

  await caption(page, 'Welcome', 'Receipts — your private decision companion.')
  await sleep(page, 2600)

  // 1) Generate a script
  await caption(page, 'Step 1', 'Generate a calm script for any hard message.')
  await sleep(page, 1800)
  await go(page, '#/script')
  await sleep(page, 900)
  try { await page.getByText('Boundary', { exact: false }).first().click(); } catch {}
  await sleep(page, 900)
  try {
    const inputs = page.locator('.input-base')
    await inputs.nth(0).fill('Alex')
    await sleep(page, 500)
    await inputs.nth(1).fill('needing some space this week')
    await sleep(page, 700)
  } catch {}
  await caption(page, 'Step 1', 'Tap once — get three tones to choose from.')
  try { await page.getByText('Generate 3 versions', { exact: false }).click(); } catch {}
  await sleep(page, 1600)
  await caption(page, 'Step 1', 'Soft · Direct · Professional. Edit freely, then copy.')
  try { await page.getByText('Direct', { exact: true }).first().click(); } catch {}
  await sleep(page, 2200)

  // 2) Decision receipt
  await caption(page, 'Step 2', 'Record why you decided — for future-you.')
  await sleep(page, 1500)
  await go(page, '#/view/decision/d1')
  await sleep(page, 1200)
  await caption(page, 'Step 2', 'Clarity score, a decision matrix, pros vs cons…')
  await softScroll(page, 1400, 16)
  await sleep(page, 1400)

  // 3) Insights
  await caption(page, 'Step 3', 'Learn how you actually decide.')
  await go(page, '#/insights')
  await sleep(page, 1400)
  await caption(page, 'Step 3', 'Calibration, emotional trends & your tells.')
  await softScroll(page, 700, 10)
  await sleep(page, 1800)

  // 4) Library
  await caption(page, 'Step 4', 'Everything lives in your Library — search & filter.')
  await go(page, '#/library')
  await sleep(page, 2200)

  // 5) Make it yours — theme switch (live)
  await caption(page, 'Step 5', 'Make it yours — four calm themes.')
  await go(page, '#/settings')
  await sleep(page, 800)
  try { await page.getByLabel('Forest theme').click() } catch {}
  await sleep(page, 1500)
  await go(page, '#/home')
  await caption(page, 'Receipts', 'Private. Local-first. Yours alone.')
  await sleep(page, 2600)

  const video = page.video()
  await ctx.close()
  await browser.close()
  const dest = path.join(OUT, 'receipts-demo.webm')
  fs.renameSync(await video.path(), dest)
  console.log('DEMO VIDEO:', dest, fs.statSync(dest).size, 'bytes')
})().catch((e) => { console.error(e); process.exit(1) })
