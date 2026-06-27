/* eslint-disable */
// Captures the full user journey as an ordered screenshot workflow:
// onboarding (the "getting started" flow — Receipts has no login) → home →
// creating a script → library → creating a decision receipt → viewing it →
// insights → settings → paywall.
let chromium
try { ;({ chromium } = require('playwright')) }
catch { ;({ chromium } = require('/opt/node22/lib/node_modules/playwright/index.js')) }
const fs = require('fs')
const path = require('path')
const seed = require('../seedshared.cjs')

const BASE = process.env.BASE || 'http://localhost:4331'
const OUT = path.join(__dirname, '..', '..', 'screenshots', 'journey')
fs.mkdirSync(OUT, { recursive: true })

let n = 0
async function shot(page, name, full = true) {
  await page.waitForTimeout(650)
  n += 1
  const file = path.join(OUT, `${String(n).padStart(2, '0')}-${name}.png`)
  await page.screenshot({ path: file, fullPage: full })
  console.log('shot:', path.basename(file))
}
async function hash(page, h, ms = 900) {
  await page.evaluate((x) => (location.hash = x), h)
  await page.waitForTimeout(ms)
}
const click = async (page, text, exact = false) => {
  try { await page.getByText(text, { exact }).first().click(); } catch {}
  await page.waitForTimeout(700)
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 400, height: 880 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()

  // ---- Getting started (onboarding) ----
  await page.goto(BASE + '/#/onboarding', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await shot(page, 'getting-started-welcome', false)
  await click(page, 'Continue')
  await shot(page, 'getting-started-scripts', false)
  await click(page, 'Continue')
  await shot(page, 'getting-started-receipts', false)
  await click(page, 'Continue')
  await shot(page, 'getting-started-privacy', false)

  // Seed mock data + enter the app (a real reload so it's read back)
  await seed(page)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1300)
  await shot(page, 'home')

  // ---- Workflow A: write a script ----
  await hash(page, '#/script')
  await shot(page, 'script-1-choose-category')
  await click(page, 'Boundary')
  try {
    const inputs = page.locator('.input-base')
    await inputs.nth(0).fill('Alex')
    await inputs.nth(1).fill('needing some space this week')
  } catch {}
  await shot(page, 'script-2-fill-details')
  await click(page, 'Generate 3 versions')
  await shot(page, 'script-3-pick-tone-and-edit')

  // ---- Library ----
  await hash(page, '#/library')
  await shot(page, 'library')

  // ---- Workflow B: record a decision receipt ----
  await hash(page, '#/receipt')
  try {
    const inputs = page.locator('.input-base, textarea')
    await page.getByPlaceholder('e.g. Why I chose Apartment B').fill('Should I move to Lisbon?')
    await page.getByPlaceholder('What did you actually decide?').fill('Leaning yes — accept the offer.')
    await page.getByPlaceholder('What makes this a good call').fill('Bigger role\nSunshine\nHigher pay')
    await page.getByPlaceholder('The downsides you accept').fill('Leaving friends\nNew language')
  } catch {}
  await shot(page, 'receipt-1-fill')

  // ---- View an existing decision (rich) ----
  await hash(page, '#/view/decision/d1')
  await shot(page, 'receipt-2-view')

  // ---- Insights ----
  await hash(page, '#/insights')
  await shot(page, 'insights')

  // ---- Settings + paywall ----
  await hash(page, '#/settings')
  await shot(page, 'settings')
  await click(page, 'Receipts Pro')
  await shot(page, 'paywall', false)

  await browser.close()
  console.log('\nJOURNEY DONE —', n, 'screenshots in', OUT)
})().catch((e) => { console.error(e); process.exit(1) })
