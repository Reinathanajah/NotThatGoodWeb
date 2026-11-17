import type { CalendarScope } from '../../types/calendar.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface EventsKeySidebarProps {
  legend: Array<{ scope: CalendarScope; label: string }>
  hiddenScopes: CalendarScope[]
  togglingScope: CalendarScope | null
  scopeError: string | null
  onToggleScope: (scope: CalendarScope) => void
}

export function EventsKeySidebar({
  legend,
  hiddenScopes,
  togglingScope,
  scopeError,
  onToggleScope,
}: EventsKeySidebarProps) {
  const hiddenSet = new Set(hiddenScopes)

  return (
    <aside className="sf-surface res-stage-card sf-stack" aria-labelledby="events-key-heading">
      <div className="sf-stack" style={{ gap: '4px' }}>
        <h2 id="events-key-heading" className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
          Events key
        </h2>
        <p className="sf-text-muted">Toggle event scopes saved to your workspace preferences.</p>
      </div>

      {scopeError ? (
        <StatusBanner variant="error" title="Filter save failed" message={scopeError} />
      ) : null}

      <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        {legend.map((item) => {
          const visible = !hiddenSet.has(item.scope)
          return (
            <label key={item.scope} className="cal-scope-row">
              <span>{item.label}</span>
              <input
                type="checkbox"
                checked={visible}
                disabled={togglingScope === item.scope}
                onChange={() => onToggleScope(item.scope)}
              />
            </label>
          )
        })}
      </div>
    </aside>
  )
}
