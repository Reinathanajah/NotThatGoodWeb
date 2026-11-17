import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { CalendarViewMode } from '../../hooks/useCalendarWorkspace.ts'
import { formatDayHeading, formatMonthHeading, type YmdParts } from '../../lib/calendarHelpers.ts'
import type { CourseSummaryDto } from '../../types/courses.ts'

interface CalendarToolbarProps {
  view: CalendarViewMode
  cursor: YmdParts
  courseId: number | undefined
  courses: CourseSummaryDto[]
  onChangeView: (view: CalendarViewMode) => void
  onStepPeriod: (delta: number) => void
  onJumpToday: () => void
  onCourseChange: (courseId: number | undefined) => void
  onOpenNewEvent: () => void
}

const VIEWS: Array<{ id: CalendarViewMode; label: string }> = [
  { id: 'month', label: 'Month' },
  { id: 'day', label: 'Day' },
  { id: 'upcoming', label: 'Upcoming' },
]

export function CalendarToolbar({
  view,
  cursor,
  courseId,
  courses,
  onChangeView,
  onStepPeriod,
  onJumpToday,
  onCourseChange,
  onOpenNewEvent,
}: CalendarToolbarProps) {
  const periodTitle =
    view === 'day'
      ? formatDayHeading(cursor)
      : view === 'upcoming'
        ? 'Upcoming events'
        : formatMonthHeading(cursor)

  return (
    <header className="sf-surface cat-header-card sf-stack" aria-labelledby="calendar-heading">
      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 260px' }}>
          <h1 id="calendar-heading" className="sf-heading-display sf-row">
            <CalendarIcon size={28} color="var(--accent)" aria-hidden="true" />
            <span>Academic calendar</span>
          </h1>
          <p className="sf-text-muted">{periodTitle}</p>
        </div>

        <button type="button" className="sf-btn sf-btn--primary" onClick={onOpenNewEvent}>
          <Plus size={16} aria-hidden="true" />
          <span>New event</span>
        </button>
      </div>

      <div className="dash-controls">
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          {view !== 'upcoming' ? (
            <>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                aria-label={view === 'day' ? 'Previous day' : 'Previous month'}
                onClick={() => onStepPeriod(-1)}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button type="button" className="sf-btn sf-btn--secondary" onClick={onJumpToday}>
                Today
              </button>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                aria-label={view === 'day' ? 'Next day' : 'Next month'}
                onClick={() => onStepPeriod(1)}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className="pf-view-group" role="group" aria-label="Calendar view">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="sf-btn sf-btn--secondary pf-view-btn"
                aria-pressed={view === item.id}
                onClick={() => onChangeView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="cal-course-filter" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Course filter
          </label>
          <select
            id="cal-course-filter"
            className="dash-select"
            value={courseId ? String(courseId) : ''}
            onChange={(e) => {
              const raw = Number(e.target.value)
              onCourseChange(raw > 0 ? raw : undefined)
            }}
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
