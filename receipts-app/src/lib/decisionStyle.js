// A short, shareable "what's your decision style?" quiz. Pure local logic.
import { THEMES, DEFAULT_THEME } from './constants.js'

export const STYLES = {
  architect: {
    id: 'architect',
    emoji: '🏛️',
    title: 'The Architect',
    blurb: 'You build decisions on evidence and structure. You weigh, you list, you sleep on it — and you rarely regret the ones you thought through.',
    traits: ['Analytical', 'Deliberate', 'Thorough'],
  },
  navigator: {
    id: 'navigator',
    emoji: '🧭',
    title: 'The Navigator',
    blurb: 'You decide by your values and your gut. When something aligns with who you are, you know — and you move with quiet conviction.',
    traits: ['Intuitive', 'Values-led', 'Self-trusting'],
  },
  diplomat: {
    id: 'diplomat',
    emoji: '🤝',
    title: 'The Diplomat',
    blurb: 'You think out loud and decide with people in mind. Advice sharpens you, and you weigh how a choice lands on everyone it touches.',
    traits: ['Collaborative', 'Empathetic', 'Open'],
  },
  sprinter: {
    id: 'sprinter',
    emoji: '⚡',
    title: 'The Sprinter',
    blurb: 'You decide fast and adjust faster. You’d rather make the call and course-correct than agonise — momentum is your superpower.',
    traits: ['Decisive', 'Bold', 'Adaptable'],
  },
}

export const QUESTIONS = [
  {
    q: 'A big decision lands in your lap. Your first move?',
    options: [
      { label: 'Make a list of pros and cons', style: 'architect' },
      { label: 'Check how each option feels', style: 'navigator' },
      { label: 'Call someone I trust', style: 'diplomat' },
      { label: 'Go with my first instinct', style: 'sprinter' },
    ],
  },
  {
    q: 'Torn between two good options, you…',
    options: [
      { label: 'Gather more information', style: 'architect' },
      { label: 'Ask which one is more “me”', style: 'navigator' },
      { label: 'See what people I respect would do', style: 'diplomat' },
      { label: 'Flip a coin and watch my reaction', style: 'sprinter' },
    ],
  },
  {
    q: 'Advice from others is…',
    options: [
      { label: 'One more data point to weigh', style: 'architect' },
      { label: 'Useful, but I trust myself most', style: 'navigator' },
      { label: 'Essential — I think out loud', style: 'diplomat' },
      { label: 'Fine, but I’ve usually decided', style: 'sprinter' },
    ],
  },
  {
    q: 'A choice turns out badly. You…',
    options: [
      { label: 'Review what I missed, methodically', style: 'architect' },
      { label: 'Ask if it still felt right at the time', style: 'navigator' },
      { label: 'Talk it through with someone', style: 'diplomat' },
      { label: 'Shrug, learn, move on quickly', style: 'sprinter' },
    ],
  },
  {
    q: 'Your ideal time to make a real decision?',
    options: [
      { label: 'Days — let it breathe', style: 'architect' },
      { label: 'Until it simply feels clear', style: 'navigator' },
      { label: 'After a few good conversations', style: 'diplomat' },
      { label: 'Minutes — momentum matters', style: 'sprinter' },
    ],
  },
  {
    q: 'What do you trust most in a tough call?',
    options: [
      { label: 'The facts', style: 'architect' },
      { label: 'My gut', style: 'navigator' },
      { label: 'My people', style: 'diplomat' },
      { label: 'My speed', style: 'sprinter' },
    ],
  },
]

export function computeStyle(answers = []) {
  const tally = { architect: 0, navigator: 0, diplomat: 0, sprinter: 0 }
  for (const a of answers) if (tally[a] != null) tally[a] += 1
  const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'navigator'
  return STYLES[winner]
}

function hexA(hex, a) {
  const h = hex.replace('#', '')
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`
}
function wrap(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = words[0] || ''
  for (let i = 1; i < words.length; i++) {
    const t = `${line} ${words[i]}`
    if (ctx.measureText(t).width > maxWidth) {
      lines.push(line)
      line = words[i]
    } else line = t
  }
  lines.push(line)
  return lines
}

export async function renderStyleCard(style, { theme = DEFAULT_THEME } = {}) {
  try {
    if (document.fonts?.ready) await document.fonts.ready
  } catch {
    /* system fonts */
  }
  const sw = THEMES.find((t) => t.id === theme) || THEMES[0]
  const scale = 2
  const W = 540
  const H = 540
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  ctx.fillStyle = sw.bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, 120, 0, W / 2, 120, W)
  glow.addColorStop(0, hexA(sw.glow, 0.25))
  glow.addColorStop(1, hexA(sw.glow, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.fillStyle = sw.accent
  ctx.font = `13px "Courier New", monospace`
  ctx.fillText('· MY DECISION STYLE ·', W / 2, 70)

  ctx.font = `96px serif`
  ctx.fillText(style.emoji, W / 2, 190)

  ctx.fillStyle = '#f5f2e9'
  ctx.font = `600 44px Newsreader, Georgia, serif`
  ctx.fillText(style.title, W / 2, 250)

  ctx.fillStyle = 'rgba(245,242,233,0.7)'
  ctx.font = `19px Newsreader, Georgia, serif`
  wrap(ctx, style.blurb, W - 120).slice(0, 5).forEach((ln, i) => ctx.fillText(ln, W / 2, 300 + i * 30))

  // traits pills
  ctx.font = `600 15px "Courier New", monospace`
  const gap = 14
  const widths = style.traits.map((t) => ctx.measureText(t.toUpperCase()).width + 32)
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (style.traits.length - 1)
  let x = (W - totalW) / 2
  const py = H - 110
  const rr = (rx, ry, rw, rh, r) => {
    ctx.beginPath()
    ctx.moveTo(rx + r, ry)
    ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, r)
    ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, r)
    ctx.arcTo(rx, ry + rh, rx, ry, r)
    ctx.arcTo(rx, ry, rx + rw, ry, r)
    ctx.closePath()
  }
  style.traits.forEach((t, i) => {
    ctx.fillStyle = hexA(sw.accent, 0.16)
    rr(x, py, widths[i], 34, 17)
    ctx.fill()
    ctx.fillStyle = sw.accent
    ctx.textAlign = 'center'
    ctx.fillText(t.toUpperCase(), x + widths[i] / 2, py + 22)
    x += widths[i] + gap
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = sw.accent
  ctx.font = `600 18px Newsreader, Georgia, serif`
  ctx.fillText('🧾 Receipts', W / 2, H - 40)

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  return { blob, dataUrl: canvas.toDataURL('image/png') }
}
