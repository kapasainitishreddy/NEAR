import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { pickDevilPrompt } from '../lib/devilsAdvocate.js'

// A small card that challenges your reasoning with a rotating counter-question.
export default function DevilsAdvocate() {
  const [prompt, setPrompt] = useState(() => pickDevilPrompt())

  return (
    <div className="rounded-2xl border border-lavender-400/20 bg-lavender-500/[0.08] p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lavender-300">
          <span>😈</span> Devil’s advocate
        </span>
        <button
          onClick={() => setPrompt((p) => pickDevilPrompt(p))}
          className="text-xs text-lavender-300/80 hover:text-lavender-200"
        >
          Challenge me again
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={prompt}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-2 font-serif text-lg leading-snug text-ivory-50"
        >
          {prompt}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
