import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import PinPad from './PinPad.jsx'
import { verifyPin } from '../lib/pin.js'
import { tapWarning } from '../lib/haptics.js'

// Full-screen gate shown when the app lock is enabled and the session is locked.
export default function LockScreen() {
  const { settings, unlock } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (pin.length < 4) return
    let active = true
    verifyPin(pin, settings.pinHash).then((ok) => {
      if (!active) return
      if (ok) {
        unlock()
      } else {
        tapWarning()
        setError(true)
        setTimeout(() => {
          if (active) {
            setPin('')
            setError(false)
          }
        }, 600)
      }
    })
    return () => {
      active = false
    }
  }, [pin, settings.pinHash, unlock])

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] text-3xl shadow-soft">
          🔒
        </div>
        <h1 className="font-serif text-2xl text-ivory-50">Welcome back</h1>
        <p className="mb-8 mt-1 text-sm text-white/45">
          {error ? 'Incorrect PIN — try again' : 'Enter your PIN to unlock'}
        </p>
        <PinPad value={pin} onChange={setPin} error={error} />
      </motion.div>
    </div>
  )
}
