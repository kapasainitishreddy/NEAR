// Clarity score: how thoroughly a decision receipt has been thought through.
// Purely local heuristic over the reflective fields — encourages depth without
// ever being punitive.

// Fields that signal a well-considered decision (title is required separately).
export const CLARITY_FIELDS = [
  'finalDecision',
  'optionsConsidered',
  'mainReason',
  'pros',
  'cons',
  'risks',
  'evidence',
  'feelings',
  'influencedBy',
  'changeMind',
  'futureMeNote',
]

const BANDS = [
  { min: 100, label: 'Crystal clear', tone: 'emerald' },
  { min: 67, label: 'Well-considered', tone: 'emerald' },
  { min: 34, label: 'Taking shape', tone: 'gold' },
  { min: 1, label: 'Just started', tone: 'lavender' },
  { min: 0, label: 'Empty', tone: 'muted' },
]

export function clarityScore(item = {}) {
  const total = CLARITY_FIELDS.length
  const filled = CLARITY_FIELDS.reduce(
    (n, key) => n + (item[key] && String(item[key]).trim() ? 1 : 0),
    0
  )
  const pct = Math.round((filled / total) * 100)
  const band = BANDS.find((b) => pct >= b.min) || BANDS[BANDS.length - 1]
  return { filled, total, pct, label: band.label, tone: band.tone }
}
