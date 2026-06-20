import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// Counts up to `value` once on mount for a lively dashboard feel.
export default function AnimatedNumber({ value = 0, duration = 900, className = '' }) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  const raf = useRef(0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * eased))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration, reduce])

  return <span className={className}>{display}</span>
}
