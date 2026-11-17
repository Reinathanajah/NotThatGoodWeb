import { Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { SCOPE_SHORT_LABELS, sortEventsByTime } from '../../lib/calendarHelpers.ts'
import { formatDateTimeShort, formatTime24 } from '../../lib/dateFormat.ts'
import type { CalendarEventDto } from '../../types/calendar.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface EventInspectorModalProps {
  selectedEvent: CalendarEventDto | null
  overflowDateKey: string | null
  overflowEvents: CalendarEventDto[]
  onSelectEvent: (ev: CalendarEventDto) => void
  onDeletePersonal: (eventId: string) => Promise<void>
  onClose: () => void
}

export function EventInspectorModal({
  selectedEvent,
  overflowDateKey,
  overflowEvents,
  onSelectEvent,
  onDeletePersonal,
  onClose,
}: EventInspectorModalProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const dialogRef = useRef<HTMLDivElement>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const open = Boolean(selectedEvent || overflowDateKey)

  useFocusTrap(open, dialogRef, onClose)

  if (!open) return null

  async function handleDelete() {
    if (!selectedEvent) return
    setDeleting(true)
    setError(null)
    try {
      await onDeletePersonal(selectedEvent.id)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to delete event')
    } finally {
      setDeleting(false)
    }
  }

  const canDelete = Boolean(
    selectedEvent && selectedEvent.scope === 'user' && selectedEvent.userId === user?.id,
  )

  return (
    <div
      className="fp-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="fp-dialog"
        style={{ width: 'min(520px, 100%)', maxHeight: '84dvh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-inspect-title"
        tabIndex={-1}
      >
        <div className="fp-header">
          <h2 id="cal-inspect-title" className="sf-heading-section">
            {selectedEvent ? selectedEvent.title : `Events on ${overflowDateKey}`}
          </h2>
          <button type="button" className="sf-btn sf-btn--ghost" aria-label="Close details" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="fp-panel sf-stack">
          {error ? <StatusBanner variant="error" title="Action failed" message={error} /> : null}

          {selectedEvent ? (
            <>
              <div className="sf-row">
                <span className="sf-badge">{SCOPE_SHORT_LABELS[selectedEvent.scope]}</span>
                {selectedEvent.courseTitle ? (
                  <span className="sf-text-muted">{selectedEvent.courseTitle}</span>
                ) : null}
              </div>
              <p className="tabular-nums">
                <strong>Starts:</strong> {formatDateTimeShort(selectedEvent.startAt, tz)}
              </p>
              {selectedEvent.endAt ? (
                <p className="tabular-nums">
                  <strong>Ends:</strong> {formatDateTimeShort(selectedEvent.endAt, tz)}
                </p>
              ) : null}
              {selectedEvent.description ? <p>{selectedEvent.description}</p> : null}

              <div className="sf-row" style={{ justifyContent: 'space-between' }}>
                {selectedEvent.courseId ? (
                  <Link href={`/courses/${selectedEvent.courseId}`} className="sf-btn sf-btn--secondary" onClick={onClose}>
                    Open course
                  </Link>
                ) : (
                  <span className="sf-text-muted">Personal schedule event</span>
                )}
                {canDelete ? (
                  <button
                    type="button"
                    className="sf-btn sf-btn--primary"
                    disabled={deleting}
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    <span>{deleting ? 'Deleting...' : 'Delete event'}</span>
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <ul className="assign-file-list">
              {sortEventsByTime(overflowEvents).map((ev) => (
                <li key={ev.id}>
                  <button type="button" className="fp-item-btn" onClick={() => onSelectEvent(ev)}>
                    <strong>{ev.title}</strong>
                    <span className="sf-text-muted tabular-nums">
                      {formatTime24(ev.startAt, tz)} · {SCOPE_SHORT_LABELS[ev.scope]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
