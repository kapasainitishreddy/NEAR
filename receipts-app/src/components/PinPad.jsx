import { motion } from 'framer-motion'
import { tapLight } from '../lib/haptics.js'

// A numeric keypad with a 4-dot entry indicator. Controlled via `value`.
export default function PinPad({ value = '', onChange, length = 4, error = false }) {
  const press = (d) => {
    if (value.length >= length) return
    tapLight()
    onChange(value + d)
  }
  const back = () => {
    tapLight()
    onChange(value.slice(0, -1))
  }

  return (
    <div className="w-full max-w-[240px]">
      {/* dots */}
      <motion.div
        animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mb-7 flex justify-center gap-3"
      >
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border transition ${
              i < value.length
                ? error
                  ? 'border-red-400 bg-red-400'
                  : 'border-gold-300 bg-gold-300'
                : 'border-white/25'
            }`}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            onClick={() => press(String(d))}
            className="grid h-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] font-serif text-2xl text-ivory-50 transition active:scale-95 hover:bg-white/[0.07]"
          >
            {d}
          </button>
        ))}
        <span />
        <button
          onClick={() => press('0')}
          className="grid h-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] font-serif text-2xl text-ivory-50 transition active:scale-95 hover:bg-white/[0.07]"
        >
          0
        </button>
        <button
          onClick={back}
          className="grid h-16 place-items-center rounded-2xl text-white/55 transition active:scale-95 hover:text-white/85"
          aria-label="Delete"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
