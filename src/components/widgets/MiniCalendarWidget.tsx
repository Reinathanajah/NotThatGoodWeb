import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { useI18n } from '../../context/i18nContextValue.ts'
import { buildMondayFirstMonthGrid, toDateKey } from '../../lib/calendarGrid.ts'
import { formatTime24 } from '../../lib/dateFormat.ts'
import { fetchCalendarEvents } from '../../services/widgetsApi.ts'
import type { CalendarViewDto } from '../../types/calendar.ts'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function getInitialDateParts(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? new Date().getFullYear())
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? new Date().getMonth() + 1)
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? new Date().getDate())
  return { year, month, dateKey: toDateKey(year, month, day) }
}

export function MiniCalendarWidget({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const { strings } = useI18n()
  const tz = user?.timezone ?? 'UTC'
  const [year, setYear] = useState(() => getInitialDateParts(tz).year)
  const [month, setMonth] = useState(() => getInitialDateParts(tz).month)
  const [selectedDate, setSelectedDate] = useState(() => getInitialDateParts(tz).dateKey)
  const [data, setData] = useState<CalendarViewDto | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchCalendarEvents({ view: 'month', year, month }, controller.signal).then(
      setData,
      () => { },
    )
    return () => controller.abort()
  }, [year, month])

  const shiftMonth = (delta: number) => {
    const shifted = new Date(Date.UTC(year, month - 1 + delta, 1))
    setYear(shifted.getUTCFullYear())
    setMonth(shifted.getUTCMonth() + 1)
    setSelectedDate(toDateKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 1))
  }

  const cells = buildMondayFirstMonthGrid(year, month)
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
  const dayEvents = data?.byDate[selectedDate] ?? []

  return (
    <section className="sf-stack" aria-labelledby="mini-cal-heading">
      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <h3 id="mini-cal-heading" className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
          {strings.dashboard.calendar}
        </h3>
        <Link href="/calendar" className="mini-cal-link" onClick={onNavigate}>
          Full calendar
        </Link>
      </div>

      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <strong>{monthLabel}</strong>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mini-cal-grid">
        {WEEKDAYS.map((day) => (
          <div key={day} className="mini-cal-head">
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const count = data?.byDate[cell.dateKey]?.length ?? 0
          return (
            <button
              key={cell.dateKey}
              type="button"
              className={`mini-cal-day${cell.isCurrentMonth ? '' : ' mini-cal-day--muted'}`}
              aria-pressed={selectedDate === cell.dateKey}
              aria-label={`${cell.dateKey}${count > 0 ? `, ${count} events` : ''}`}
              onClick={() => setSelectedDate(cell.dateKey)}
            >
              <span>{cell.dayNumber}</span>
              {count > 0 ? <span className="mini-cal-marker" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>

      <div className="clock-readout-row">
        <p className="sf-text-muted tabular-nums">Events on {selectedDate}</p>
        {dayEvents.length === 0 ? (
          <p className="sf-text-muted">No scheduled deadlines on this date.</p>
        ) : (
          dayEvents.slice(0, 3).map((ev) => (
            <div key={ev.id} className="sf-row" style={{ justifyContent: 'space-between' }}>
              <span>{ev.title}</span>
              <span className="sf-text-muted tabular-nums">{formatTime24(ev.startAt, tz)}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
