import { useNavigate } from 'react-router-dom'
import { Card, StatusBadge } from './ui.jsx'
import { StarIcon, ScriptIcon, ReceiptIcon, ClockIcon } from './icons.jsx'
import { fmtDate, isDue, truncate } from '../lib/format.js'
import { getCategory } from '../lib/scriptTemplates.js'

export default function ItemCard({ item, onToggleFavorite }) {
  const navigate = useNavigate()
  const isScript = item.type === 'script'
  const preview = isScript ? item.content : item.finalDecision
  const cat = isScript ? getCategory(item.categoryId).label : item.category
  const due = isDue(item.reviewDate)

  return (
    <Card interactive onClick={() => navigate(`/view/${item.type}/${item.id}`)} className="group">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            isScript ? 'bg-lavender-500/15 text-lavender-300' : 'bg-gold-500/15 text-gold-300'
          }`}
        >
          {isScript ? <ScriptIcon className="h-5 w-5" /> : <ReceiptIcon className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-ivory-50">{item.title || 'Untitled'}</h3>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(item)
                }}
                className={`shrink-0 transition ${item.favorite ? 'text-gold-300' : 'text-white/25 hover:text-white/50'}`}
                aria-label="Toggle favorite"
              >
                <StarIcon filled={item.favorite} className="h-5 w-5" />
              </button>
            )}
          </div>

          {preview && (
            <p className="mt-1 text-sm leading-relaxed text-white/45 line-clamp-2">{truncate(preview, 130)}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            {cat && <span className="pill bg-white/[0.04] text-white/50">{cat}</span>}
            {item.reviewDate && (
              <span
                className={`pill ${due ? 'bg-gold-500/15 text-gold-300' : 'bg-white/[0.04] text-white/45'}`}
              >
                <ClockIcon className="h-3.5 w-3.5" />
                {due ? 'Review due' : fmtDate(item.reviewDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
