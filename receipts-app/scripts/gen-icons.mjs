// Generates maskable PNG app icons (no external image libraries).
// Draws a navy gradient tile with a torn "receipt" mark, then encodes PNG
// manually via zlib. Run: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

const lerp = (a, b, t) => Math.round(a + (b - a) * t)

function render(S) {
  const buf = Buffer.alloc(S * S * 4)
  const px = (x, y, r, g, b, a = 255) => {
    const i = (y * S + x) * 4
    // simple alpha-over compositing onto existing pixel
    const ba = buf[i + 3] / 255
    const aa = a / 255
    const outA = aa + ba * (1 - aa)
    const mix = (cf, cb) => (outA === 0 ? 0 : Math.round((cf * aa + cb * ba * (1 - aa)) / outA))
    buf[i] = mix(r, buf[i])
    buf[i + 1] = mix(g, buf[i + 1])
    buf[i + 2] = mix(b, buf[i + 2])
    buf[i + 3] = Math.round(outA * 255)
  }

  // Background: vertical navy gradient (full-bleed for maskable safe area)
  for (let y = 0; y < S; y++) {
    const t = y / (S - 1)
    const r = lerp(22, 10, t)
    const g = lerp(32, 15, t)
    const b = lerp(59, 29, t)
    for (let x = 0; x < S; x++) px(x, y, r, g, b, 255)
  }

  // Receipt geometry
  const x0 = 0.30 * S
  const x1 = 0.70 * S
  const yTop = 0.235 * S
  const teethTop = 0.70 * S
  const teethBot = 0.745 * S
  const rc = 0.045 * S
  const teeth = 6
  const toothW = (x1 - x0) / teeth

  const tornBottom = (x) => {
    const local = ((x - x0) % toothW) / toothW // 0..1 within a tooth
    const tri = local < 0.5 ? local * 2 : (1 - local) * 2 // up then down
    return teethTop + tri * (teethBot - teethTop)
  }

  const inReceipt = (x, y) => {
    if (x < x0 || x > x1) return false
    if (y < yTop) return false
    if (y > tornBottom(x)) return false
    // round top corners
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

  // Paint the ivory receipt with a soft drop shadow first
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const sx = x - 0.012 * S, sy = y - 0.012 * S
      if (inReceipt(sx, sy)) px(x, y, 4, 6, 12, 70)
    }
  }
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (inReceipt(x, y)) px(x, y, 245, 242, 233, 255)
    }
  }

  // Lines on the receipt: navy title bar, gold + lavender rows
  const bar = (yc, h, xa, xb, r, g, b) => {
    for (let y = Math.round(yc); y < Math.round(yc + h); y++)
      for (let x = Math.round(xa); x < Math.round(xb); x++)
        if (inReceipt(x, y)) px(x, y, r, g, b, 255)
  }
  bar(0.33 * S, 0.035 * S, 0.37 * S, 0.63 * S, 22, 32, 59)
  bar(0.42 * S, 0.026 * S, 0.37 * S, 0.63 * S, 199, 154, 67) // gold
  bar(0.49 * S, 0.026 * S, 0.37 * S, 0.55 * S, 167, 158, 240) // lavender

  return buf
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const tb = Buffer.from(type, 'ascii')
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(Buffer.concat([tb, data])) >>> 0, 0)
    return Buffer.concat([len, tb, data, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // rest zero (compression, filter, interlace)
  // raw scanlines with filter byte 0
  const raw = Buffer.alloc(height * (width * 4 + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// CRC32 (PNG spec)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

for (const size of [192, 512]) {
  const png = encodePNG(size, size, render(size))
  writeFileSync(join(OUT, `icon-${size}.png`), png)
  console.log(`wrote icon-${size}.png (${png.length} bytes)`)
}
