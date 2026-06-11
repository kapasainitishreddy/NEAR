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
