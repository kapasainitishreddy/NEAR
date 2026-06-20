import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { Chip, EmptyState, Input } from '../components/ui.jsx'
import ItemCard from '../components/ItemCard.jsx'
import { SearchIcon } from '../components/icons.jsx'
import { EmptyLibraryArt, SearchArt } from '../components/illustrations.jsx'
import { KINDS, STATUSES } from '../lib/constants.js'
import { isDue } from '../lib/format.js'
import { getCategory } from '../lib/scriptTemplates.js'

function matchesQuery(item, q) {
  if (!q) return true
  const hay = [
    item.title,
    item.content,
    item.finalDecision,
    item.mainReason,
    item.category,
    item.type === 'script' ? getCategory(item.categoryId).label : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(q.toLowerCase())
}

export default function Library() {
  const { scripts, decisions, saveTo } = useApp()
  const [kind, setKind] = useState('all')
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')

  const all = useMemo(
    () => [...scripts, ...decisions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [scripts, decisions]
  )

  const filtered = useMemo(() => {
    return all.filter((item) => {
      if (kind === 'script' && item.type !== 'script') return false
      if (kind === 'decision' && item.type !== 'decision') return false
      if (kind === 'favorite' && !item.favorite) return false
      if (kind === 'followup' && item.status !== 'followup') return false
      if (kind === 'review' && !isDue(item.reviewDate)) return false
      if (status !== 'all' && item.status !== status) return false
      if (!matchesQuery(item, query)) return false
      return true
    })
  }, [all, kind, status, query])

  const toggleFavorite = (item) => {
    saveTo(item.type === 'script' ? 'scripts' : 'decisions', { ...item, favorite: !item.favorite })
  }

  return (
    <>
      <TopBar title="Library" subtitle={`${all.length} saved item${all.length === 1 ? '' : 's'}`} />

      {/* Search */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
          <SearchIcon className="h-5 w-5" />
        </span>
        <Input
          className="pl-11"
          placeholder="Search titles, decisions, reasons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Kind filters */}
      <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
        {KINDS.map((k) => (
          <Chip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}>
            {k.label}
          </Chip>
        ))}
      </div>

      {/* Status filters */}
      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>
          Any status
        </Chip>
        {STATUSES.map((s) => (
          <Chip key={s.id} active={status === s.id} onClick={() => setStatus(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          art={all.length === 0 ? <EmptyLibraryArt /> : <SearchArt />}
          title={all.length === 0 ? 'Your library is empty' : 'No matches'}
          subtitle={
            all.length === 0
              ? 'Saved scripts and decision receipts will collect here, beautifully organized.'
              : 'Try a different filter or search term.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </>
  )
}
