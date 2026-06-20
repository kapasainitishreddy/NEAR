// Renders a Receipts item into a shareable "torn paper receipt" PNG, entirely
// on-device with <canvas> (no libraries, no network). Used by the Share-as-image
// action. Returns a Blob + data URL so callers can share or download it.
import { THEMES, DEFAULT_THEME } from './constants.js'
import { clarityScore } from './clarity.js'

const SERIF = 'Newsreader, Georgia, serif'
const SANS = '"Inter Variable", Inter, system-ui, sans-serif'
const MONO = '"Courier New", ui-monospace, monospace'

const PAPER = '#f6f1e6'
const PAPER_EDGE = '#ece4d2'
const INK = '#2a2620'
const INK_DIM = '#8a8170'

function fmtDate(iso) {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Greedy word-wrap returning an array of lines that fit maxWidth.
function wrapLines(ctx, text, maxWidth) {
  const out = []
  for (const paragraph of String(text).split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (!words.length) {
      out.push('')
      continue
    }
    let line = words[0]
    for (let i = 1; i < words.length; i++) {
      const test = `${line} ${words[i]}`
      if (ctx.measureText(test).width > maxWidth) {
        out.push(line)
        line = words[i]
      } else {
        line = test
      }
    }
    out.push(line)
  }
  return out
}

function fieldsFor(item) {
  if (item.type === 'script') {
    return [['The message', item.content]]
  }
  return [
    ['Final decision', item.finalDecision],
    ['Main reason', item.mainReason],
    ['Note to future me', item.futureMeNote],
  ].filter(([, v]) => v && String(v).trim())
}

export async function renderReceiptCard(item, { theme = DEFAULT_THEME } = {}) {
  // Make sure our bundled fonts are ready so canvas text matches the app.
  try {
    if (document.fonts?.ready) await document.fonts.ready
  } catch {
    /* fonts API unavailable — fall back to system fonts */
  }

  const swatch = THEMES.find((t) => t.id === theme) || THEMES[0]
  const scale = 2 // retina
  const W = 640
  const pad = 48 // canvas padding around the paper
  const paperW = W - pad * 2
  const cx = pad + paperW / 2
  const innerPad = 40
  const contentW = paperW - innerPad * 2
  const isScript = item.type === 'script'

  // ---- Layout pass: measure total height -------------------------------
  const meas = document.createElement('canvas').getContext('2d')
  const blocks = []
  let y = 0
  const top = pad + 30 // leave room above for straight top edge

  const push = (b, h) => {
    blocks.push({ ...b, y: top + y })
    y += h
  }

  push({ kind: 'brand' }, 40)
  push({ kind: 'type' }, 26)
  push({ kind: 'divider' }, 22)
  push({ kind: 'meta' }, 30)

  // title
  meas.font = `600 30px ${SERIF}`
  const titleLines = wrapLines(meas, item.title || 'Untitled', contentW)
  push({ kind: 'title', lines: titleLines }, titleLines.length * 36 + 14)

  // fields
  for (const [label, value] of fieldsFor(item)) {
    meas.font = `16px ${SANS}`
    const lines = wrapLines(meas, value, contentW)
    const h = 22 + lines.length * 23 + 16
    push({ kind: 'field', label, lines }, h)
  }

  push({ kind: 'divider' }, 22)
  push({ kind: 'footer' }, 26)
  push({ kind: 'barcode' }, 52)

  const contentBottom = top + y + 8
  const teeth = 16
  const toothH = 12
  const paperBottom = contentBottom + toothH
  const H = paperBottom + pad

  // ---- Draw pass --------------------------------------------------------
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'alphabetic'

  // backdrop (theme canvas colour + soft accent glow)
  ctx.fillStyle = swatch.bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W)
  glow.addColorStop(0, hexA(swatch.glow, 0.18))
  glow.addColorStop(1, hexA(swatch.glow, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // paper path (rounded top, zig-zag torn bottom)
  const left = pad
  const right = pad + paperW
  const radius = 14
  ctx.beginPath()
  ctx.moveTo(left, pad + radius)
  ctx.arcTo(left, pad, left + radius, pad, radius)
  ctx.lineTo(right - radius, pad)
  ctx.arcTo(right, pad, right, pad + radius, radius)
  ctx.lineTo(right, contentBottom)
  for (let i = 0; i < teeth; i++) {
    const x1 = right - ((i + 0.5) * paperW) / teeth
    const x2 = right - ((i + 1) * paperW) / teeth
    ctx.lineTo(x1, contentBottom + toothH)
    ctx.lineTo(x2, contentBottom)
  }
  ctx.lineTo(left, pad + radius)
  ctx.closePath()

  // paper fill + shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 34
  ctx.shadowOffsetY = 18
  const paperGrad = ctx.createLinearGradient(0, pad, 0, paperBottom)
  paperGrad.addColorStop(0, PAPER)
  paperGrad.addColorStop(1, PAPER_EDGE)
  ctx.fillStyle = paperGrad
  ctx.fill()
  ctx.restore()

  for (const b of blocks) {
    if (b.kind === 'brand') {
      ctx.fillStyle = INK
      ctx.font = `700 22px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText('✦  R E C E I P T S', cx, b.y + 24)
    } else if (b.kind === 'type') {
      ctx.fillStyle = INK_DIM
      ctx.font = `12px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText(isScript ? 'PANIC SCRIPT' : 'DECISION RECEIPT', cx, b.y + 14)
    } else if (b.kind === 'divider') {
      dottedLine(ctx, left + innerPad, right - innerPad, b.y + 10)
    } else if (b.kind === 'meta') {
      ctx.fillStyle = INK_DIM
      ctx.font = `12px ${MONO}`
      ctx.textAlign = 'left'
      const cat = isScript ? 'SCRIPT' : (item.category || 'DECISION').toUpperCase()
      ctx.fillText(cat, left + innerPad, b.y + 16)
      ctx.textAlign = 'right'
      ctx.fillText(fmtDate(item.updatedAt || item.createdAt), right - innerPad, b.y + 16)
    } else if (b.kind === 'title') {
      ctx.fillStyle = INK
      ctx.font = `600 30px ${SERIF}`
      ctx.textAlign = 'left'
      b.lines.forEach((ln, i) => ctx.fillText(ln, left + innerPad, b.y + 26 + i * 36))
    } else if (b.kind === 'field') {
      ctx.fillStyle = INK_DIM
      ctx.font = `700 11px ${MONO}`
      ctx.textAlign = 'left'
      ctx.fillText(b.label.toUpperCase(), left + innerPad, b.y + 12)
      ctx.fillStyle = INK
      ctx.font = `16px ${SANS}`
      b.lines.forEach((ln, i) => ctx.fillText(ln, left + innerPad, b.y + 34 + i * 23))
    } else if (b.kind === 'footer') {
      ctx.fillStyle = INK_DIM
      ctx.font = `11px ${MONO}`
      ctx.textAlign = 'center'
      ctx.fillText('saved on this device · nothing sent anywhere', cx, b.y + 14)
    } else if (b.kind === 'barcode') {
      drawBarcode(ctx, left + innerPad, b.y + 8, contentW, 30)
    }
  }

  // Clarity stamp for decisions (rotated, accent ink)
  if (!isScript) {
    const score = clarityScore(item)
    drawStamp(ctx, right - 70, pad + 86, score.pct, swatch.accent)
  }

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  const dataUrl = canvas.toDataURL('image/png')
  return { blob, dataUrl, canvas, width: W, height: H }
}

function dottedLine(ctx, x1, x2, y) {
  ctx.save()
  ctx.strokeStyle = INK_DIM
  ctx.lineWidth = 1.5
  ctx.setLineDash([2, 5])
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.restore()
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save()
  ctx.fillStyle = INK
  let cursor = x
  let i = 0
  while (cursor < x + w - 4) {
    const bw = 1 + ((i * 7) % 4) // pseudo-random but deterministic
    if (i % 2 === 0) ctx.fillRect(cursor, y, bw, h)
    cursor += bw + 1.5
    i++
  }
  ctx.restore()
}

function drawStamp(ctx, x, y, pct, accent) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((-12 * Math.PI) / 180)
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.9
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(0, 0, 34, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 28, 0, Math.PI * 2)
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.font = `700 18px ${MONO}`
  ctx.fillText(`${pct}%`, 0, -1)
  ctx.font = `700 8px ${MONO}`
  ctx.fillText('CLARITY', 0, 12)
  ctx.restore()
}

// "#rrggbb" + alpha → rgba()
function hexA(hex, a) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
