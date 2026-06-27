// Gentle, anxiety-free gamification: reflection streaks and "calm badges"
// computed entirely from local data.
import { clarityScore } from './clarity.js'
import { outcomeMeta } from './constants.js'

function dayKey(d) {
  const x = new Date(d)
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`
}

// Current consecutive-day streak of any activity (created/updated items),
// counting back from today (or yesterday, so it doesn't break overnight).
export function computeStreak(items = []) {
  const days = new Set()
  for (const it of items) {
    if (it.createdAt) days.add(dayKey(it.createdAt))
    if (it.updatedAt) days.add(dayKey(it.updatedAt))
  }
  if (days.size === 0) return 0
  let streak = 0
  const cursor = new Date()
  // allow today OR yesterday to be the latest active day
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// Badge catalogue. Each returns { earned, progress (0..1) }.
export function badges({ scripts = [], decisions = [], rules = [] } = {}) {
  const all = [...scripts, ...decisions, ...rules]
  const reviewed = decisions.filter((d) => d.outcome)
  const reliefs = reviewed.filter((d) => outcomeMeta(d.outcome)?.score === 1)
  const clarityHigh = decisions.filter((d) => clarityScore(d).pct >= 80)
  const streak = computeStreak(all)

  const defs = [
    { id: 'first-step', emoji: '🌱', label: 'First Step', desc: 'Saved your first entry', value: all.length, goal: 1 },
    { id: 'scribe', emoji: '✍️', label: 'Scribe', desc: 'Wrote 5 scripts', value: scripts.length, goal: 5 },
    { id: 'archivist', emoji: '🗂️', label: 'Archivist', desc: 'Recorded 10 decisions', value: decisions.length, goal: 10 },
    { id: 'clear-mind', emoji: '✨', label: 'Clear Mind', desc: '3 crystal-clear receipts', value: clarityHigh.length, goal: 3 },
    { id: 'honest', emoji: '🎯', label: 'Honest with Self', desc: 'Reviewed 5 outcomes', value: reviewed.length, goal: 5 },
    { id: 'well-calibrated', emoji: '🧭', label: 'Well Calibrated', desc: '5 decisions brought relief', value: reliefs.length, goal: 5 },
    { id: 'principled', emoji: '📜', label: 'Principled', desc: 'Wrote 3 personal rules', value: rules.length, goal: 3 },
    { id: 'steady', emoji: '🔥', label: 'Steady', desc: '3-day reflection streak', value: streak, goal: 3 },
    { id: 'devoted', emoji: '💎', label: 'Devoted', desc: '7-day reflection streak', value: streak, goal: 7 },
  ]

  return defs.map((d) => ({
    ...d,
    earned: d.value >= d.goal,
    progress: Math.max(0, Math.min(1, d.value / d.goal)),
  }))
}
