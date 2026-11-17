import { useAuth } from '../../context/authContextValue.ts'
import { SCOPE_SHORT_LABELS, sortEventsByTime } from '../../lib/calendarHelpers.ts'
import { formatDateHeading, formatTime24 } from '../../lib/dateFormat.ts'
import type { CalendarEventDto, CalendarViewDto } from '../../types/calendar.ts'

interface CalendarTimelineViewsProps {
  mode: 'day' | 'upcoming'
  data: CalendarViewDto
  onSelectEvent: (event: CalendarEventDto) => void
}

export function CalendarTimelineViews({
  mode,
  data,
  onSelectEvent,
}: CalendarTimelineViewsProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? data.timezone ?? 'UTC'

  if (mode === 'day') {
    const events = sortEventsByTime(data.events)
    return (
      <section className="sf-surface res-stage-card sf-stack" aria-label="Day timeline">
        {events.length === 0 ? (
          <p className="sf-text-muted">No scheduled events for this date.</p>
        ) : (
          <ul className="assign-file-list">
            {events.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  className="fp-item-btn"
                  onClick={() => onSelectEvent(ev)}
                >
                  <div className="sf-stack" style={{ gap: '2px' }}>
                    <strong>{ev.title}</strong>
                    <span className="sf-text-muted">
                      {ev.courseCode ? `${ev.courseCode} · ` : ''}
                      {SCOPE_SHORT_LABELS[ev.scope]}
                    </span>
                  </div>
                  <span className="sf-badge tabular-nums">
                    {formatTime24(ev.startAt, tz)}
                    {ev.endAt ? ` to ${formatTime24(ev.endAt, tz)}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  const dateKeys = Object.keys(data.byDate).sort()

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-label="Upcoming events">
      {dateKeys.length === 0 ? (
        <p className="sf-text-muted">No upcoming events match your active filters.</p>
      ) : (
        dateKeys.map((dateKey) => {
          const dayEvents = sortEventsByTime(data.byDate[dateKey] ?? [])
          return (
            <div key={dateKey} className="sf-stack" style={{ gap: 'var(--space-2)' }}>
              <h2 className="timeline-group-heading">
                {dayEvents[0] ? formatDateHeading(dayEvents[0].startAt, tz) : dateKey}
              </h2>
              <ul className="assign-file-list">
                {dayEvents.map((ev) => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      className="fp-item-btn"
                      onClick={() => onSelectEvent(ev)}
                    >
                      <div className="sf-stack" style={{ gap: '2px' }}>
                        <strong>{ev.title}</strong>
                        <span className="sf-text-muted">
                          {ev.courseCode ? `${ev.courseCode} · ` : ''}
                          {SCOPE_SHORT_LABELS[ev.scope]}
                        </span>
                      </div>
                      <span className="sf-text-muted tabular-nums">
                        {formatTime24(ev.startAt, tz)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })
      )}
    </section>
  )
}
