// RevenueCat adapter. Normalises the native (Capacitor) and web SDKs behind one
// small interface, lazy-imported so the web bundle stays lean and the app runs
// even when billing isn't configured. Nothing here runs unless API keys are set.
import { Capacitor } from '@capacitor/core'
import { REVENUECAT, isPurchasesConfigured, resolvedApiKey } from '../config.js'

let inited = false
let webInstance = null
const isNative = () => Capacitor?.isNativePlatform?.() === true

function appUserId() {
  try {
    let id = localStorage.getItem('rc_app_user_id')
    if (!id) {
      id = 'rcu_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem('rc_app_user_id', id)
    }
    return id
  } catch {
    return undefined
  }
}

function platformKey() {
  // Placeholder-aware: returns '' while the keys are still the X… placeholders.
  return resolvedApiKey(isNative() ? Capacitor.getPlatform() : 'web')
}

export async function initPurchases() {
  if (inited || !isPurchasesConfigured()) return inited
  const apiKey = platformKey()
  if (!apiKey) return false
  try {
    if (isNative()) {
      const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor')
      if (import.meta.env.DEV) await Purchases.setLogLevel({ level: LOG_LEVEL.WARN })
      await Purchases.configure({ apiKey })
    } else {
      const { Purchases } = await import('@revenuecat/purchases-js')
      webInstance = Purchases.configure(apiKey, appUserId())
    }
    inited = true
  } catch (e) {
    if (import.meta.env.DEV) console.warn('RevenueCat init failed:', e)
  }
  return inited
}

// → { active: boolean }
export async function checkEntitlement() {
  if (!inited) return { active: false }
  const id = REVENUECAT.entitlementId
  try {
    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const { customerInfo } = await Purchases.getCustomerInfo()
      return { active: !!customerInfo?.entitlements?.active?.[id] }
    }
    const info = await webInstance.getCustomerInfo()
    return { active: !!info?.entitlements?.active?.[id] }
  } catch {
    return { active: false }
  }
}

// → [{ key, title, price, raw }]
export async function getPackages() {
  if (!inited) return []
  try {
    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const offerings = await Purchases.getOfferings()
      const pkgs = offerings?.current?.availablePackages || []
      return pkgs.map((p) => ({
        key: p.identifier,
        title: p.product?.title || p.identifier,
        price: p.product?.priceString || '',
        raw: p,
      }))
    }
    const offerings = await webInstance.getOfferings()
    const pkgs = offerings?.current?.availablePackages || []
    return pkgs.map((p) => ({
      key: p.identifier,
      title: p.webBillingProduct?.title || p.rcBillingProduct?.title || p.identifier,
      price:
        p.webBillingProduct?.currentPrice?.formattedPrice ||
        p.rcBillingProduct?.currentPrice?.formattedPrice ||
        '',
      raw: p,
    }))
  } catch (e) {
    if (import.meta.env.DEV) console.warn('getPackages failed:', e)
    return []
  }
}

// → { active: boolean, cancelled?: boolean }
export async function purchase(pkg) {
  if (!inited || !pkg) return { active: false }
  const id = REVENUECAT.entitlementId
  try {
    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg.raw })
      return { active: !!customerInfo?.entitlements?.active?.[id] }
    }
    const { customerInfo } = await webInstance.purchase({ rcPackage: pkg.raw })
    return { active: !!customerInfo?.entitlements?.active?.[id] }
  } catch (e) {
    if (e?.userCancelled || e?.code === 'UserCancelledError') return { active: false, cancelled: true }
    if (import.meta.env.DEV) console.warn('purchase failed:', e)
    return { active: false }
  }
}

export async function restore() {
  if (!inited) return { active: false }
  const id = REVENUECAT.entitlementId
  try {
    if (isNative()) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor')
      const { customerInfo } = await Purchases.restorePurchases()
      return { active: !!customerInfo?.entitlements?.active?.[id] }
    }
    // Web billing restores via the configured app user / RevenueCat account.
    const info = await webInstance.getCustomerInfo()
    return { active: !!info?.entitlements?.active?.[id] }
  } catch {
    return { active: false }
  }
}
