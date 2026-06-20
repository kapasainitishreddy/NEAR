import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isPurchasesConfigured } from '../config.js'
import { initPurchases, checkEntitlement, getPackages, purchase as doPurchase, restore as doRestore } from '../lib/purchases.js'

const PurchaseContext = createContext(null)

export function usePurchases() {
  const ctx = useContext(PurchaseContext)
  if (!ctx) throw new Error('usePurchases must be used within PurchaseProvider')
  return ctx
}

export function PurchaseProvider({ children }) {
  const configured = isPurchasesConfigured()
  // When billing isn't configured, the app stays fully unlocked so nothing is
  // crippled before monetisation is switched on.
  const [pro, setPro] = useState(!configured)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) return
    let active = true
    ;(async () => {
      const ok = await initPurchases()
      if (!ok || !active) {
        if (active) setLoading(false)
        return
      }
      const [{ active: ent }, pkgs] = await Promise.all([checkEntitlement(), getPackages()])
      if (!active) return
      setPro(ent)
      setPackages(pkgs)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [configured])

  const buy = useCallback(async (pkg) => {
    const res = await doPurchase(pkg)
    if (res.active) setPro(true)
    return res
  }, [])

  const restore = useCallback(async () => {
    const res = await doRestore()
    if (res.active) setPro(true)
    return res
  }, [])

  const value = useMemo(
    () => ({ configured, pro, packages, loading, buy, restore }),
    [configured, pro, packages, loading, buy, restore]
  )

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>
}
