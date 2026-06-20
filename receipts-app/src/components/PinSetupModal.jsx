import { useState } from 'react'
import Modal from './Modal.jsx'
import PinPad from './PinPad.jsx'
import { hashPin } from '../lib/pin.js'

// Two-step PIN setup (choose, then confirm) for enabling the app lock.
export default function PinSetupModal({ open, onClose, onComplete }) {
  const [stage, setStage] = useState('choose') // choose | confirm
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const reset = () => {
    setStage('choose')
    setFirst('')
    setPin('')
    setError(false)
  }
  const close = () => {
    onClose()
    setTimeout(reset, 250)
  }

  const handleChange = async (next) => {
    setError(false)
    setPin(next)
    if (next.length < 4) return
    if (stage === 'choose') {
      setFirst(next)
      setStage('confirm')
      setPin('')
    } else {
      if (next === first) {
        const hash = await hashPin(next)
        onComplete(hash)
        close()
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setStage('choose')
          setFirst('')
          setError(false)
        }, 700)
      }
    }
  }

  return (
    <Modal open={open} onClose={close} title="Set an app lock">
      <p className="mb-6 text-center text-white/55">
        {error
          ? 'PINs didn’t match — let’s start over'
          : stage === 'choose'
            ? 'Choose a 4-digit PIN'
            : 'Confirm your PIN'}
      </p>
      <div className="flex justify-center">
        <PinPad value={pin} onChange={handleChange} error={error} />
      </div>
      <p className="mt-6 text-center text-xs text-white/35">
        Stored only on this device as a one-way hash. If you forget it, you can reset the app from a backup.
      </p>
    </Modal>
  )
}
