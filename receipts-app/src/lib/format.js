// Small date + text helpers.

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = d.getTime() - Date.now()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (Math.abs(days) < 1) return 'today'
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  return rtf.format(Math.round(days / 30), 'month')
}

export function isDue(iso) {
  if (!iso) return false
  return new Date(iso).getTime() <= Date.now()
}

export function isUpcoming(iso, withinDays = 14) {
  if (!iso) return false
  const diff = new Date(iso).getTime() - Date.now()
  return diff > 0 && diff <= withinDays * 24 * 60 * 60 * 1000
}

export function truncate(str = '', n = 120) {
  const s = String(str).trim()
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
