import { useAuth } from '../../context/authContextValue.ts'
import { buildMondayFirstMonthGrid } from '../../lib/calendarGrid.ts'
import {
  getMonthDayKey,
  getTodayYmdInZone,
  SCOPE_SHORT_LABELS,
  sortEventsByTime,
  type YmdParts,
} from '../../lib/calendarHelpers.ts'
import { formatTime24 } from '../../lib/dateFormat.ts'
import type { CalendarEventDto, CalendarViewDto } from '../../types/calendar.ts'

interface CalendarMonthViewProps {
  cursor: YmdParts
  data: CalendarViewDto
  onSelectDay: (dateKey: string) => void
  onSelectEvent: (event: CalendarEventDto) => void
  onOpenOverflowDay: (dateKey: string) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function CalendarMonthView({
  cursor,
  data,
  onSelectDay,
  onSelectEvent,
  onOpenOverflowDay,
}: CalendarMonthViewProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? data.timezone ?? 'UTC'
  const todayKey = getMonthDayKey(getTodayYmdInZone(tz))
  const cells = buildMondayFirstMonthGrid(cursor.year, cursor.month)
  const populatedDays = cells.filter(
    (c) => c.isCurrentMonth && (data.byDate[c.dateKey]?.length ?? 0) > 0,
  )

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-label="Month schedule">
      <div className="cal-desktop-matrix">
        <div className="cal-grid">
          {WEEKDAYS.map((day) => (
            <div key={day} className="cal-weekday-head">
              {day}
            </div>
          ))}

          {cells.map((cell) => {
            const dayEvents = sortEventsByTime(data.byDate[cell.dateKey] ?? [])
            const visibleEvents = dayEvents.slice(0, 2)
            const hiddenCount = Math.max(0, dayEvents.length - visibleEvents.length)
            const isToday = cell.dateKey === todayKey

            return (
              <div
                key={cell.dateKey}
                className={`cal-cell${cell.isCurrentMonth ? '' : ' cal-cell--muted'}`}
              >
                <button
                  type="button"
                  className={`cal-cell-day-btn tabular-nums${isToday ? ' cal-cell-day-btn--today' : ''}`}
                  aria-label={`Open day schedule for ${cell.dateKey}`}
                  onClick={() => onSelectDay(cell.dateKey)}
                >
                  {cell.dayNumber}
                </button>

                {visibleEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className="cal-event-btn"
                    title={`${ev.title} (${formatTime24(ev.startAt, tz)})`}
                    onClick={() => onSelectEvent(ev)}
                  >
                    {formatTime24(ev.startAt, tz)} {ev.title}
                  </button>
                ))}

                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    className="cal-more-btn tabular-nums"
                    onClick={() => onOpenOverflowDay(cell.dateKey)}
                  >
                    +{hiddenCount} more
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="cal-mobile-agenda">
        {populatedDays.length === 0 ? (
          <p className="sf-text-muted">No scheduled events visible in this month.</p>
        ) : (
          populatedDays.map((cell) => {
            const list = sortEventsByTime(data.byDate[cell.dateKey] ?? [])
            return (
              <div key={cell.dateKey} className="sf-stack" style={{ gap: 'var(--space-2)' }}>
                <strong className="tabular-nums">{cell.dateKey}</strong>
                {list.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className="fp-item-btn"
                    onClick={() => onSelectEvent(ev)}
                  >
                    <span>
                      <strong>{ev.title}</strong>
                    </span>
                    <span className="sf-text-muted tabular-nums">
                      {formatTime24(ev.startAt, tz)} · {SCOPE_SHORT_LABELS[ev.scope]}
                    </span>
                  </button>
                ))}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
