import { X } from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { useAuth } from '../../context/authContextValue.ts'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { buildDateTimeIsoUtc, getMonthDayKey, getTodayYmdInZone } from '../../lib/calendarHelpers.ts'
import type { CreateCalendarEventInput } from '../../types/calendar.ts'
import type { CourseSummaryDto } from '../../types/courses.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { EventFormFields } from './EventFormFields.tsx'

interface NewEventModalProps {
  open: boolean
  courses: CourseSummaryDto[]
  onSubmit: (input: CreateCalendarEventInput) => Promise<unknown>
  onClose: () => void
}

export function NewEventModal({ open, courses, onSubmit, onClose }: NewEventModalProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const dialogRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => getMonthDayKey(getTodayYmdInZone(tz)))
  const [startTime, setStartTime] = useState('19:00')
  const [endTime, setEndTime] = useState('')
  const [courseId, setCourseId] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useFocusTrap(open, dialogRef, onClose)

  if (!open) return null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Enter an event title.')
      return
    }
    const startAt = buildDateTimeIsoUtc(date, startTime || '09:00')
    const endAt = endTime ? buildDateTimeIsoUtc(date, endTime) : null
    if (endAt && new Date(endAt).getTime() < new Date(startAt).getTime()) {
      setError('End time must be at or after start time.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        scope: 'user',
        courseId: courseId ? Number(courseId) : undefined,
        startAt,
        endAt,
      })
      setTitle('')
      setDescription('')
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save calendar event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fp-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="fp-dialog"
        style={{ width: 'min(540px, 100%)', maxHeight: '88dvh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-new-title"
        tabIndex={-1}
      >
        <div className="fp-header">
          <h2 id="cal-new-title" className="sf-heading-section">
            New personal event
          </h2>
          <button type="button" className="sf-btn sf-btn--ghost" aria-label="Close modal" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="fp-panel sf-stack" onSubmit={handleSubmit}>
          {error ? <StatusBanner variant="error" title="Check event fields" message={error} /> : null}
          <EventFormFields
            title={title}
            date={date}
            startTime={startTime}
            endTime={endTime}
            courseId={courseId}
            description={description}
            courses={courses}
            onTitleChange={setTitle}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onCourseIdChange={setCourseId}
            onDescriptionChange={setDescription}
          />
          <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="sf-btn sf-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sf-btn sf-btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
