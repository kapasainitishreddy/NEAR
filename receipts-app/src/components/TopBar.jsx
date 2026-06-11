import { useNavigate } from 'react-router-dom'
import { Button } from './ui.jsx'
import { BackIcon, SettingsIcon } from './icons.jsx'

export default function TopBar({ title, subtitle, back = false, right, onSettings = true }) {
  const navigate = useNavigate()
  return (
    <header className="pt-safe sticky top-0 z-20 -mx-5 mb-4 px-5 pb-3 pt-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {back && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <BackIcon />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-2xl leading-tight text-ivory-50">{title}</h1>
          {subtitle && <p className="truncate text-sm text-white/45">{subtitle}</p>}
        </div>
        {right}
        {onSettings && !right && (
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} aria-label="Settings">
            <SettingsIcon />
          </Button>
        )}
      </div>
    </header>
  )
}
