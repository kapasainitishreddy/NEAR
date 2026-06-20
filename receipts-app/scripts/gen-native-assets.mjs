// Generates source assets for @capacitor/assets (no image libraries):
//   assets/icon.png        1024x1024  (app icon, full-bleed navy + receipt)
//   assets/splash.png      2732x2732  (launch screen, centered receipt)
//   assets/splash-dark.png 2732x2732  (same, dark theme)
// Run: node scripts/gen-native-assets.mjs   (or: npm run assets)
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'assets')
mkdirSync(OUT, { recursive: true })

const lerp = (a, b, t) => Math.round(a + (b - a) * t)

// Draw a navy gradient tile with a torn "receipt". `hw` = half width of the
// receipt as a fraction of S; `topFrac` = top of the receipt as a fraction of S.
function renderTile(S, { hw, topFrac }) {
  const buf = Buffer.alloc(S * S * 4)
  const px = (x, y, r, g, b, a = 255) => {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || y < 0 || x >= S || y >= S) return
    const i = (y * S + x) * 4
    const ba = buf[i + 3] / 255, aa = a / 255
    const outA = aa + ba * (1 - aa)
    const mix = (cf, cb) => (outA === 0 ? 0 : Math.round((cf * aa + cb * ba * (1 - aa)) / outA))
    buf[i] = mix(r, buf[i]); buf[i + 1] = mix(g, buf[i + 1]); buf[i + 2] = mix(b, buf[i + 2])
    buf[i + 3] = Math.round(outA * 255)
  }

  // Background gradient (full-bleed)
  for (let y = 0; y < S; y++) {
    const t = y / (S - 1)
    const r = lerp(22, 10, t), g = lerp(32, 15, t), b = lerp(59, 29, t)
    for (let x = 0; x < S; x++) px(x, y, r, g, b, 255)
  }

  const cx = 0.5 * S
  const x0 = cx - hw * S, x1 = cx + hw * S
  const w = x1 - x0
  const yTop = topFrac * S
  const h = 1.28 * w
  const teethTop = yTop + 0.91 * h
  const teethBot = yTop + h
  const rc = 0.11 * w
  const teeth = 6
  const toothW = w / teeth

  const tornBottom = (x) => {
    const local = ((x - x0) % toothW) / toothW
    const tri = local < 0.5 ? local * 2 : (1 - local) * 2
    return teethTop + tri * (teethBot - teethTop)
  }
  const inReceipt = (x, y) => {
    if (x < x0 || x > x1 || y < yTop || y > tornBottom(x)) return false
    if (y < yTop + rc) {
      if (x < x0 + rc) {
        const dx = x0 + rc - x, dy = yTop + rc - y
        if (dx * dx + dy * dy > rc * rc) return false
      } else if (x > x1 - rc) {
        const dx = x - (x1 - rc), dy = yTop + rc - y
        if (dx * dx + dy * dy > rc * rc) return false
      }
    }
    return true
  }

  // soft shadow then ivory body
  const off = 0.012 * S
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++)
      if (inReceipt(x - off, y - off)) px(x, y, 4, 6, 12, 70)
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++)
      if (inReceipt(x, y)) px(x, y, 245, 242, 233, 255)

  const bar = (yc, th, xa, xb, r, g, b) => {
    for (let y = Math.round(yc); y < Math.round(yc + th); y++)
      for (let x = Math.round(xa); x < Math.round(xb); x++)
        if (inReceipt(x, y)) px(x, y, r, g, b, 255)
  }
  const lx0 = x0 + 0.175 * w, lx1 = x0 + 0.825 * w, lxMid = x0 + 0.625 * w
  bar(yTop + 0.19 * h, 0.07 * h, lx0, lx1, 22, 32, 59)
  bar(yTop + 0.36 * h, 0.05 * h, lx0, lx1, 199, 154, 67)
  bar(yTop + 0.50 * h, 0.05 * h, lx0, lxMid, 167, 158, 240)
  return buf
}

// --- PNG encoder ---
const CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
const crc32 = (b) => {
  let c = 0xffffffff
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function encodePNG(S, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
    const tb = Buffer.from(type, 'ascii')
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])) >>> 0, 0)
    return Buffer.concat([len, tb, data, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6
  const raw = Buffer.alloc(S * (S * 4 + 1))
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0
    rgba.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4)
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

const write = (name, S, opts) => {
  const png = encodePNG(S, renderTile(S, opts))
  writeFileSync(join(OUT, name), png)
  console.log(`wrote assets/${name} (${S}x${S}, ${png.length} bytes)`)
}

write('icon.png', 1024, { hw: 0.205, topFrac: 0.235 })
write('splash.png', 2732, { hw: 0.12, topFrac: 0.345 })
write('splash-dark.png', 2732, { hw: 0.12, topFrac: 0.345 })
