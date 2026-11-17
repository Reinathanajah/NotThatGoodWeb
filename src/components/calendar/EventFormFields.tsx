import type { CourseSummaryDto } from '../../types/courses.ts'

interface EventFormFieldsProps {
  title: string
  date: string
  startTime: string
  endTime: string
  courseId: string
  description: string
  courses: CourseSummaryDto[]
  onTitleChange: (val: string) => void
  onDateChange: (val: string) => void
  onStartTimeChange: (val: string) => void
  onEndTimeChange: (val: string) => void
  onCourseIdChange: (val: string) => void
  onDescriptionChange: (val: string) => void
}

export function EventFormFields({
  title,
  date,
  startTime,
  endTime,
  courseId,
  description,
  courses,
  onTitleChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onCourseIdChange,
  onDescriptionChange,
}: EventFormFieldsProps) {
  return (
    <>
      <div className="foundation-field">
        <label htmlFor="cal-ev-title">Event title</label>
        <input id="cal-ev-title" type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} />
      </div>
      <div className="sf-row">
        <div className="foundation-field" style={{ flex: '1 1 160px' }}>
          <label htmlFor="cal-ev-date">Date</label>
          <input id="cal-ev-date" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        <div className="foundation-field" style={{ flex: '1 1 110px' }}>
          <label htmlFor="cal-ev-start">Start</label>
          <input id="cal-ev-start" type="time" value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} />
        </div>
        <div className="foundation-field" style={{ flex: '1 1 110px' }}>
          <label htmlFor="cal-ev-end">End (optional)</label>
          <input id="cal-ev-end" type="time" value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} />
        </div>
      </div>
      <div className="foundation-field">
        <label htmlFor="cal-ev-course">Course (optional)</label>
        <select id="cal-ev-course" className="dash-select" value={courseId} onChange={(e) => onCourseIdChange(e.target.value)}>
          <option value="">Personal (no course linked)</option>
          {courses.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.code} · {c.title}</option>
          ))}
        </select>
      </div>
      <div className="foundation-field">
        <label htmlFor="cal-ev-desc">Notes (optional)</label>
        <textarea id="cal-ev-desc" className="assign-comment-textarea" value={description} onChange={(e) => onDescriptionChange(e.target.value)} />
      </div>
    </>
  )
}
