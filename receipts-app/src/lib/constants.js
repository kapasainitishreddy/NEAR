// Shared domain constants used across screens.

export const STATUSES = [
  { id: 'draft', label: 'Draft', tone: 'text-white/70 bg-white/10' },
  { id: 'sent', label: 'Sent', tone: 'text-lavender-300 bg-lavender-500/15' },
  { id: 'resolved', label: 'Resolved', tone: 'text-emerald-300 bg-emerald-500/15' },
  { id: 'followup', label: 'Follow-up needed', tone: 'text-gold-300 bg-gold-500/15' },
  { id: 'reviewed', label: 'Reviewed', tone: 'text-navy-100 bg-navy-100/10' },
]

export function statusMeta(id) {
  return STATUSES.find((s) => s.id === id) || STATUSES[0]
}

export const DECISION_CATEGORIES = [
  'Money',
  'Career',
  'Relationships',
  'Health',
  'Housing',
  'Education',
  'Purchases',
  'Personal',
  'Other',
]

// Library item "kinds" for filtering.
export const KINDS = [
  { id: 'all', label: 'All' },
  { id: 'script', label: 'Scripts' },
  { id: 'decision', label: 'Receipts' },
  { id: 'favorite', label: 'Favorites' },
  { id: 'followup', label: 'Follow-ups' },
  { id: 'review', label: 'Reviews' },
]

// Theme gallery. `swatch`/`accent`/`glow` are hex mirrors of the CSS-var
// palettes in index.css, used to paint the live preview chips in Settings.
export const THEMES = [
  { id: 'midnight', label: 'Midnight', bg: '#0a0f1d', surface: '#161a22', accent: '#d9b466', glow: '#a79ef0' },
  { id: 'obsidian', label: 'Obsidian', bg: '#0b0d10', surface: '#121418', accent: '#8fb6d6', glow: '#8fb6d6' },
  { id: 'sepia', label: 'Sepia', bg: '#16100a', surface: '#1b140d', accent: '#e0b06a', glow: '#e0b06a' },
  { id: 'forest', label: 'Forest', bg: '#0a1410', surface: '#101a16', accent: '#cdbb6e', glow: '#7ac8a0' },
]

export const DEFAULT_THEME = 'midnight'
export function isValidTheme(id) {
  return THEMES.some((t) => t.id === id)
}

// Outcome of a decision, recorded at review time — powers the calibration score
// and pattern insights. Ordered worst → best for scoring.
export const OUTCOMES = [
  { id: 'regret', label: 'Regret', emoji: '😞', score: 0, tone: 'text-red-300 bg-red-500/15' },
  { id: 'mixed', label: 'Mixed', emoji: '😐', score: 0.5, tone: 'text-gold-300 bg-gold-500/15' },
  { id: 'relief', label: 'Relief', emoji: '😌', score: 1, tone: 'text-emerald-300 bg-emerald-500/15' },
]

export function outcomeMeta(id) {
  return OUTCOMES.find((o) => o.id === id) || null
}

// Reversibility — Bezos' "one-way vs two-way doors".
export const REVERSIBILITY = [
  {
    id: 'reversible',
    label: 'Reversible',
    emoji: '🔄',
    hint: 'A two-way door — you can undo this. Decide quickly.',
    tone: 'text-emerald-300 bg-emerald-500/15',
  },
  {
    id: 'irreversible',
    label: 'Hard to undo',
    emoji: '🚪',
    hint: 'A one-way door — hard to reverse. Take your time.',
    tone: 'text-gold-300 bg-gold-500/15',
  },
]
export function reversibilityMeta(id) {
  return REVERSIBILITY.find((r) => r.id === id) || null
}

// Starter set of core values for the Values Compass (users can add their own).
export const VALUE_SUGGESTIONS = [
  'Honesty',
  'Security',
  'Freedom',
  'Growth',
  'Family',
  'Health',
  'Kindness',
  'Ambition',
  'Peace',
  'Adventure',
  'Loyalty',
  'Creativity',
]
