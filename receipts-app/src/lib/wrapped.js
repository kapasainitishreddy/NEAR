// "Decision Wrapped" — a shareable year-in-review of someone's decisions,
// rendered as a poster image entirely on-device.
import { THEMES, DEFAULT_THEME, outcomeMeta } from './constants.js'
import { computeStreak } from './gamification.js'

const SERIF = 'Newsreader, Georgia, serif'
const MONO = '"Courier New", ui-monospace, monospace'

export function computeWrapped({ scripts = [], decisions = [], rules = [] } = {}, year) {
  const inYear = (d) =>
    year == null ? true : new Date(d.createdAt || Date.now()).getFullYear() === year
  const decs = decisions.filter(inYear)
  const scr = scripts.filter(inYear)

  // calibration
  const reviewed = decs.filter((d) => outcomeMeta(d.outcome))
  const relief = reviewed.filter((d) => outcomeMeta(d.outcome)?.score === 1).length
  const reliefPct = reviewed.length ? Math.round((relief / reviewed.length) * 100) : null

  // top category
  const counts = {}
  for (const d of decs) counts[d.category || 'Personal'] = (counts[d.category || 'Personal'] || 0) + 1
  const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  // most reflective month
  const months = {}
  for (const d of decs) {
    const m = new Date(d.createdAt || Date.now()).toLocaleString('en', { month: 'long' })
    months[m] = (months[m] || 0) + 1
  }
  const busiestMonth = Object.entries(months).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  // a signature decision (favorite, else highest clarity-ish: most fields)
  const fav =
    decs.find((d) => d.favorite) ||
    decs.slice().sort((a, b) => (b.mainReason?.length || 0) - (a.mainReason?.length || 0))[0]

  return {
    year: year ?? new Date().getFullYear(),
    decisions: decs.length,
    scripts: scr.length,
    rules: rules.length,
    reliefPct,
    topCategory,
    busiestMonth,
    streak: computeStreak([...scripts, ...decisions, ...rules]),
    signature: fav?.title || null,
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
function hexA(hex, a) {
  const h = hex.replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`
}

export async function renderWrapped(stats, { theme = DEFAULT_THEME } = {}) {
  try {
    if (document.fonts?.ready) await document.fonts.ready
  } catch {
    /* system fonts */
  }
  const sw = THEMES.find((t) => t.id === theme) || THEMES[0]
  const scale = 2
  const W = 540
  const H = 720
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // backdrop
  ctx.fillStyle = sw.bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, 60, 0, W / 2, 60, W)
  glow.addColorStop(0, hexA(sw.glow, 0.22))
  glow.addColorStop(1, hexA(sw.glow, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.fillStyle = sw.accent
  ctx.font = `13px ${MONO}`
  ctx.fillText(`· MY ${stats.year} IN DECISIONS ·`, W / 2, 64)

  // hero number
  ctx.fillStyle = '#f5f2e9'
  ctx.font = `600 120px ${SERIF}`
  ctx.fillText(String(stats.decisions), W / 2, 200)
  ctx.font = `400 22px ${SERIF}`
  ctx.fillStyle = 'rgba(245,242,233,0.7)'
  ctx.fillText(stats.decisions === 1 ? 'decision, recorded' : 'decisions, recorded', W / 2, 234)

  // stat rows
  const rows = [
    stats.reliefPct != null ? [`${stats.reliefPct}%`, 'brought relief'] : ['—', 'awaiting outcomes'],
    [stats.topCategory, 'your top theme'],
    [stats.busiestMonth, 'most reflective month'],
    [`${stats.scripts}`, stats.scripts === 1 ? 'calm script written' : 'calm scripts written'],
  ]
  let y = 300
  for (const [big, small] of rows) {
    ctx.fillStyle = hexA('#ffffff', 0.05)
    roundRect(ctx, 60, y, W - 120, 64, 18)
    ctx.fill()
    ctx.textAlign = 'left'
    ctx.fillStyle = sw.accent
    ctx.font = `600 30px ${SERIF}`
    ctx.fillText(String(big), 86, y + 42)
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(245,242,233,0.65)'
    ctx.font = `16px ${SERIF}`
    ctx.fillText(small, W - 86, y + 41)
    y += 76
  }

  // signature line
  if (stats.signature) {
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(245,242,233,0.55)'
    ctx.font = `italic 16px ${SERIF}`
    const sig = stats.signature.length > 42 ? stats.signature.slice(0, 40) + '…' : stats.signature
    ctx.fillText(`Signature call: “${sig}”`, W / 2, y + 24)
  }

  // footer
  ctx.textAlign = 'center'
  ctx.fillStyle = sw.accent
  ctx.font = `600 18px ${SERIF}`
  ctx.fillText('🧾 Receipts', W / 2, H - 34)

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  return { blob, dataUrl: canvas.toDataURL('image/png') }
}
