// Local reminders for review dates and decide-by deadlines. Native-only via
// Capacitor Local Notifications — on the web it's a graceful no-op (browser
// scheduled notifications need a service worker and are out of scope here).
import { Capacitor } from '@capacitor/core'

const isNative = () => Capacitor?.isNativePlatform?.() === true

async function plugin() {
  const mod = await import('@capacitor/local-notifications')
  return mod.LocalNotifications
}

// Stable numeric ids per item so we can cancel/replace cleanly.
function hashId(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h) % 2000000000
}
const reviewId = (id) => hashId('review:' + id)
const decideId = (id) => hashId('decide:' + id)

export async function requestPermission() {
  if (!isNative()) return false
  try {
    const LN = await plugin()
    const res = await LN.requestPermissions()
    return res.display === 'granted'
  } catch {
    return false
  }
}

function future(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  // fire at 9am local on the target day if it's in the future
  d.setHours(9, 0, 0, 0)
  return d.getTime() > Date.now() ? d : null
}

export async function scheduleForItem(item) {
  if (!isNative() || !item) return
  try {
    const LN = await plugin()
    const toCancel = [{ id: reviewId(item.id) }, { id: decideId(item.id) }]
    await LN.cancel({ notifications: toCancel }).catch(() => {})

    const notifications = []
    const reviewAt = future(item.reviewDate)
    if (reviewAt && !item.outcome) {
      notifications.push({
        id: reviewId(item.id),
        title: 'Time to review a decision',
        body: `How did “${item.title || 'your decision'}” turn out?`,
        schedule: { at: reviewAt },
      })
    }
    const decideAt = future(item.decideBy)
    if (decideAt && !item.outcome) {
      notifications.push({
        id: decideId(item.id),
        title: 'A decision is waiting',
        body: `You set today to decide on “${item.title || 'your decision'}.”`,
        schedule: { at: decideAt },
      })
    }
    if (notifications.length) await LN.schedule({ notifications })
  } catch {
    /* ignore scheduling failures */
  }
}

export async function cancelForItem(id) {
  if (!isNative()) return
  try {
    const LN = await plugin()
    await LN.cancel({ notifications: [{ id: reviewId(id) }, { id: decideId(id) }] })
  } catch {
    /* ignore */
  }
}

// Reschedule everything (e.g. after enabling reminders).
export async function syncAll(decisions = []) {
  if (!isNative()) return
  for (const d of decisions) await scheduleForItem(d)
}
