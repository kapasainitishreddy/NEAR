// Renders a "Personal Operating Manual" — your rules + guiding principles — as
// an elegant, shareable poster image. On-device <canvas>, no network.
import { THEMES, DEFAULT_THEME } from './constants.js'

const SERIF = 'Newsreader, Georgia, serif'
const SANS = '"Inter Variable", Inter, system-ui, sans-serif'
const MONO = '"Courier New", ui-monospace, monospace'

function wrap(ctx, text, maxWidth) {
  const out = []
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    if (!words.length) {
      out.push('')
      continue
    }
    let line = words[0]
    for (let i = 1; i < words.length; i++) {
      const t = `${line} ${words[i]}`
      if (ctx.measureText(t).width > maxWidth) {
        out.push(line)
        line = words[i]
      } else line = t
    }
    out.push(line)
  }
  return out
}

export async function renderManual({ name, rules = [], principles = [] }, { theme = DEFAULT_THEME } = {}) {
  try {
    if (document.fonts?.ready) await document.fonts.ready
  } catch {
    /* fall back to system fonts */
  }

  const sw = THEMES.find((t) => t.id === theme) || THEMES[0]
  const scale = 2
  const W = 640
  const M = 44 // outer margin
  const innerPad = 40
  const frameLeft = M
  const frameRight = W - M
  const contentLeft = frameLeft + innerPad
  const contentW = frameRight - frameLeft - innerPad * 2

  const meas = document.createElement('canvas').getContext('2d')
  const blocks = []
  let y = M + 36
  const add = (b, h) => {
    blocks.push({ ...b, y })
    y += h
  }

  add({ kind: 'kicker' }, 22)
  add({ kind: 'title' }, name ? 84 : 56)
  add({ kind: 'rule-divider' }, 28)

  if (rules.length) {
    add({ kind: 'section', text: 'My rules' }, 34)
    rules.forEach((r, i) => {
      meas.font = `500 18px ${SERIF}`
      const lines = wrap(meas, r.text, contentW - 34)
      add({ kind: 'rule', n: i + 1, lines }, lines.length * 25 + 16)
    })
    add({ kind: 'gap' }, 10)
  }

  if (principles.length) {
    add({ kind: 'rule-divider' }, 28)
    add({ kind: 'section', text: 'Principles I return to' }, 34)
    principles.forEach((p) => {
      meas.font = `italic 17px ${SERIF}`
      const lines = wrap(meas, `“${p}”`, contentW - 18)
      add({ kind: 'principle', lines }, lines.length * 24 + 14)
    })
  }

  add({ kind: 'footer' }, 40)

  const H = y + M
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // backdrop
  ctx.fillStyle = sw.bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W)
  glow.addColorStop(0, hexA(sw.glow, 0.16))
  glow.addColorStop(1, hexA(sw.glow, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // frame
  ctx.strokeStyle = hexA(sw.accent, 0.55)
  ctx.lineWidth = 1.5
  roundRect(ctx, frameLeft, M, frameRight - frameLeft, H - M * 2, 18)
  ctx.stroke()

  const cx = (frameLeft + frameRight) / 2
  for (const b of blocks) {
    if (b.kind === 'kicker') {
      ctx.fillStyle = sw.accent
      ctx.font = `12px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText('· PERSONAL OPERATING MANUAL ·', cx, b.y + 6)
    } else if (b.kind === 'title') {
      ctx.fillStyle = '#f5f2e9'
      ctx.textAlign = 'center'
      if (name) {
        ctx.font = `600 34px ${SERIF}`
        ctx.fillText('The Constitution of', cx, b.y + 24)
        ctx.fillStyle = sw.accent
        ctx.font = `600 40px ${SERIF}`
        ctx.fillText(name, cx, b.y + 68)
      } else {
        ctx.font = `600 40px ${SERIF}`
        ctx.fillText('How I Decide', cx, b.y + 40)
      }
    } else if (b.kind === 'rule-divider') {
      ctx.fillStyle = sw.accent
      ctx.textAlign = 'center'
      ctx.font = `16px ${SERIF}`
      ctx.fillText('✦', cx, b.y + 8)
    } else if (b.kind === 'section') {
      ctx.fillStyle = hexA('#ffffff', 0.5)
      ctx.textAlign = 'left'
      ctx.font = `700 12px ${MONO}`
      ctx.fillText(b.text.toUpperCase(), contentLeft, b.y + 12)
    } else if (b.kind === 'rule') {
      ctx.fillStyle = sw.accent
      ctx.textAlign = 'left'
      ctx.font = `600 16px ${MONO}`
      ctx.fillText(String(b.n).padStart(2, '0'), contentLeft, b.y + 16)
      ctx.fillStyle = '#f1ece0'
      ctx.font = `500 18px ${SERIF}`
      b.lines.forEach((ln, i) => ctx.fillText(ln, contentLeft + 34, b.y + 16 + i * 25))
    } else if (b.kind === 'principle') {
      ctx.fillStyle = 'rgba(245,242,233,0.8)'
      ctx.textAlign = 'left'
      ctx.font = `italic 17px ${SERIF}`
      b.lines.forEach((ln, i) => ctx.fillText(ln, contentLeft + 18, b.y + 14 + i * 24))
    } else if (b.kind === 'footer') {
      ctx.fillStyle = hexA('#ffffff', 0.4)
      ctx.textAlign = 'center'
      ctx.font = `11px ${MONO}`
      ctx.fillText('written by me, for me · kept on this device', cx, b.y + 14)
    }
  }

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  return { blob, dataUrl: canvas.toDataURL('image/png'), width: W, height: H }
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
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
