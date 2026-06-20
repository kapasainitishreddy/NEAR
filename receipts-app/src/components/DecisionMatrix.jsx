import { Input } from './ui.jsx'
import { PlusIcon, TrashIcon } from './icons.jsx'

// A weighted decision matrix editor. Controlled via `value`/`onChange`.
// Shape: { options: string[], criteria: {name,weight}[], scores: {"oIcJ": 1..5} }
export const emptyMatrix = () => ({
  options: ['', ''],
  criteria: [{ name: '', weight: 3 }],
  scores: {},
})

export function matrixTotals(m) {
  if (!m?.options?.length) return []
  return m.options.map((opt, i) => {
    let total = 0
    let max = 0
    m.criteria.forEach((c, j) => {
      const w = Number(c.weight) || 0
      const s = Number(m.scores?.[`o${i}c${j}`]) || 0
      total += w * s
      max += w * 5
    })
    return { i, opt, total, pct: max ? Math.round((total / max) * 100) : 0 }
  })
}

export function matrixIsMeaningful(m) {
  return (
    m &&
    m.options?.some((o) => o.trim()) &&
    m.criteria?.some((c) => c.name.trim()) &&
    Object.keys(m.scores || {}).length > 0
  )
}

export default function DecisionMatrix({ value, onChange }) {
  const m = value || emptyMatrix()
  const set = (patch) => onChange({ ...m, ...patch })

  const totals = matrixTotals(m)
  const winner = totals.reduce((a, b) => (b.total > (a?.total ?? -1) ? b : a), null)
  const hasWinner = winner && winner.total > 0

  const setOption = (i, v) => {
    const options = [...m.options]
    options[i] = v
    set({ options })
  }
  const addOption = () => m.options.length < 4 && set({ options: [...m.options, ''] })
  const removeOption = (i) => {
    const options = m.options.filter((_, idx) => idx !== i)
    set({ options, scores: reindex(m.scores, 'o', i, m.criteria.length, 'col') })
  }

  const setCriterion = (j, patch) => {
    const criteria = m.criteria.map((c, idx) => (idx === j ? { ...c, ...patch } : c))
    set({ criteria })
  }
  const addCriterion = () =>
    m.criteria.length < 5 && set({ criteria: [...m.criteria, { name: '', weight: 3 }] })
  const removeCriterion = (j) => {
    const criteria = m.criteria.filter((_, idx) => idx !== j)
    set({ criteria })
  }

  const setScore = (i, j, s) => set({ scores: { ...m.scores, [`o${i}c${j}`]: s } })

  return (
    <div className="space-y-4">
      {/* Options */}
      <div>
        <div className="label-base">Options</div>
        <div className="space-y-2">
          {m.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => setOption(i, e.target.value)}
              />
              {m.options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="shrink-0 text-white/30 hover:text-red-300"
                  aria-label="Remove option"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {m.options.length < 4 && (
          <button onClick={addOption} className="mt-2 text-sm text-gold-300/80 hover:text-gold-300">
            + Add option
          </button>
        )}
      </div>

      {/* Criteria + weights */}
      <div>
        <div className="label-base">What matters (weight 1–5)</div>
        <div className="space-y-2">
          {m.criteria.map((c, j) => (
            <div key={j} className="flex items-center gap-2">
              <Input
                value={c.name}
                placeholder={`Criterion ${j + 1} — e.g. cost`}
                onChange={(e) => setCriterion(j, { name: e.target.value })}
              />
              <select
                value={c.weight}
                onChange={(e) => setCriterion(j, { weight: Number(e.target.value) })}
                className="input-base w-16 shrink-0 px-2 text-center"
                aria-label="Weight"
              >
                {[1, 2, 3, 4, 5].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {m.criteria.length > 1 && (
                <button
                  onClick={() => removeCriterion(j)}
                  className="shrink-0 text-white/30 hover:text-red-300"
                  aria-label="Remove criterion"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {m.criteria.length < 5 && (
          <button onClick={addCriterion} className="mt-2 text-sm text-gold-300/80 hover:text-gold-300">
            + Add criterion
          </button>
        )}
      </div>

      {/* Scoring grid */}
      {m.options.some((o) => o.trim()) && m.criteria.some((c) => c.name.trim()) && (
        <div>
          <div className="label-base">Score each option (1–5)</div>
          <div className="space-y-3">
            {m.options.map((opt, i) =>
              opt.trim() ? (
                <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-ivory-50">{opt}</span>
                    {hasWinner && winner.i === i && (
                      <span className="pill bg-gold-400/15 text-gold-300">👑 Best fit · {winner.pct}%</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {m.criteria.map((c, j) =>
                      c.name.trim() ? (
                        <div key={j} className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm text-white/55">{c.name}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => {
                              const active = Number(m.scores?.[`o${i}c${j}`]) === s
                              return (
                                <button
                                  key={s}
                                  onClick={() => setScore(i, j, s)}
                                  className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${
                                    active
                                      ? 'bg-gold-400 text-navy-950'
                                      : 'bg-white/[0.05] text-white/55 hover:bg-white/[0.1]'
                                  }`}
                                >
                                  {s}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// When an option column is removed, drop its scores and shift later ones down.
function reindex(scores = {}, prefix, removedIndex) {
  const next = {}
  for (const [key, val] of Object.entries(scores)) {
    const match = key.match(/^o(\d+)c(\d+)$/)
    if (!match) continue
    const oi = Number(match[1])
    const cj = Number(match[2])
    if (oi === removedIndex) continue
    const newOi = oi > removedIndex ? oi - 1 : oi
    next[`o${newOi}c${cj}`] = val
  }
  return next
}
