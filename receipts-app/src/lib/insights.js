// Local, on-device analytics over decision receipts. No data leaves the device;
// these are simple heuristics that turn your own history into a mirror.
import { outcomeMeta } from './constants.js'
import { clarityScore } from './clarity.js'

// ---- Sentiment (tiny lexicon) --------------------------------------------
const POS = [
  'calm', 'confident', 'hopeful', 'relieved', 'relief', 'happy', 'excited', 'sure',
  'peace', 'peaceful', 'grateful', 'proud', 'clear', 'ready', 'good', 'safe', 'love',
  'optimistic', 'content', 'settled', 'strong',
]
const NEG = [
  'anxious', 'anxiety', 'scared', 'afraid', 'fear', 'angry', 'sad', 'guilty', 'guilt',
  'worried', 'worry', 'stressed', 'stress', 'overwhelmed', 'nervous', 'uncertain',
  'unsure', 'tired', 'exhausted', 'frustrated', 'lonely', 'doubt', 'regret', 'panic',
  'confused', 'hurt', 'ashamed',
]

export function sentiment(text = '') {
  const words = String(text).toLowerCase().match(/[a-z']+/g) || []
  let s = 0
  for (const w of words) {
    if (POS.includes(w)) s += 1
    else if (NEG.includes(w)) s -= 1
  }
  // squash to -1..1
  if (s === 0) return 0
  return Math.max(-1, Math.min(1, s / 3))
}

// ---- Time-of-day buckets --------------------------------------------------
export const TIME_BUCKETS = [
  { id: 'morning', label: 'Morning', range: [5, 12] },
  { id: 'afternoon', label: 'Afternoon', range: [12, 17] },
  { id: 'evening', label: 'Evening', range: [17, 22] },
  { id: 'latenight', label: 'Late night', range: [22, 5] },
]
function bucketForHour(h) {
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'latenight'
}

// score 0 (regret) .. 1 (relief)
function outcomeValue(item) {
  const m = outcomeMeta(item.outcome)
  return m ? m.score : null
}

function reliefRate(items) {
  const scored = items.map(outcomeValue).filter((v) => v !== null)
  if (!scored.length) return null
  return scored.reduce((a, b) => a + b, 0) / scored.length
}

// ---- Calibration ----------------------------------------------------------
export function calibration(decisions) {
  const withOutcome = decisions.filter((d) => outcomeValue(d) !== null)
  const rate = reliefRate(withOutcome)
  return {
    count: withOutcome.length,
    pct: rate == null ? 0 : Math.round(rate * 100),
    pending: decisions.filter((d) => !d.outcome).length,
  }
}

// ---- Pattern "tells" ------------------------------------------------------
// Each finding only appears once there's enough signal to be honest.
export function patterns(decisions) {
  const withOutcome = decisions.filter((d) => outcomeValue(d) !== null)
  const findings = []
  if (withOutcome.length < 3) return findings

  // 1) Time of day
  const byBucket = {}
  for (const d of withOutcome) {
    const b = bucketForHour(new Date(d.createdAt || Date.now()).getHours())
    ;(byBucket[b] ||= []).push(d)
  }
  const bucketRates = Object.entries(byBucket)
    .filter(([, arr]) => arr.length >= 2)
    .map(([id, arr]) => ({ id, label: TIME_BUCKETS.find((t) => t.id === id)?.label, rate: reliefRate(arr) }))
  if (bucketRates.length >= 2) {
    bucketRates.sort((a, b) => a.rate - b.rate)
    const worst = bucketRates[0]
    const best = bucketRates[bucketRates.length - 1]
    if (best.rate - worst.rate >= 0.25) {
      findings.push({
        emoji: '🕯️',
        title: `${best.label} decisions tend to go best`,
        body: `You report relief ${Math.round(best.rate * 100)}% of the time for ${best.label.toLowerCase()} decisions, vs ${Math.round(
          worst.rate * 100
        )}% for ${worst.label.toLowerCase()}.`,
      })
    }
  }

  // 2) Influenced vs solo
  const influenced = withOutcome.filter((d) => (d.influencedBy || '').trim())
  const solo = withOutcome.filter((d) => !(d.influencedBy || '').trim())
  if (influenced.length >= 2 && solo.length >= 2) {
    const ri = reliefRate(influenced)
    const rs = reliefRate(solo)
    if (Math.abs(ri - rs) >= 0.2) {
      findings.push({
        emoji: '🪞',
        title: ri > rs ? 'Advice tends to help you' : 'You decide best on your own',
        body:
          ri > rs
            ? `Decisions where others weighed in feel right ${Math.round(ri * 100)}% of the time.`
            : `Solo decisions feel right ${Math.round(rs * 100)}% of the time, vs ${Math.round(ri * 100)}% when influenced.`,
      })
    }
  }

  // 3) Clarity correlation
  const high = withOutcome.filter((d) => clarityScore(d).pct >= 60)
  const low = withOutcome.filter((d) => clarityScore(d).pct < 60)
  if (high.length >= 2 && low.length >= 2) {
    const rh = reliefRate(high)
    const rl = reliefRate(low)
    if (rh - rl >= 0.2) {
      findings.push({
        emoji: '✨',
        title: 'Thinking it through pays off',
        body: `Well-considered decisions feel right ${Math.round(rh * 100)}% of the time, vs ${Math.round(
          rl * 100
        )}% for rushed ones.`,
      })
    }
  }

  // 4) Rest / energy correlation
  const tired = withOutcome.filter((d) => d.rested && d.rested <= 2)
  const fresh = withOutcome.filter((d) => d.rested && d.rested >= 4)
  if (tired.length >= 2 && fresh.length >= 2) {
    const rt = reliefRate(tired)
    const rf = reliefRate(fresh)
    if (rf - rt >= 0.2) {
      findings.push({
        emoji: '😴',
        title: 'Rest changes your judgment',
        body: `Decisions you made well-rested feel right ${Math.round(rf * 100)}% of the time, vs ${Math.round(
          rt * 100
        )}% when you were running on empty.`,
      })
    }
  }

  return findings
}

// ---- Emotion timeline -----------------------------------------------------
export function emotionSeries(decisions, limit = 16) {
  return decisions
    .filter((d) => (d.feelings || '').trim())
    .slice()
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    .slice(-limit)
    .map((d) => ({ id: d.id, title: d.title, score: sentiment(d.feelings), at: d.createdAt }))
}
