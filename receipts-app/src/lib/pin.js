// PIN hashing for the optional app lock. Uses SubtleCrypto (SHA-256) so the raw
// PIN is never stored. This is a privacy convenience for a local-only app, not
// bank-grade security.
export async function hashPin(pin) {
  const data = new TextEncoder().encode(`receipts:v1:${pin}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPin(pin, hash) {
  if (!hash) return false
  try {
    return (await hashPin(pin)) === hash
  } catch {
    return false
  }
}
