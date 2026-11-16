import { Eye, EyeOff, Star } from 'lucide-react'
import type { CourseSummaryDto } from '../../types/courses.ts'

interface CourseActionButtonsProps {
  course: CourseSummaryDto
  onToggleStar: (course: CourseSummaryDto) => void
  onToggleHide: (course: CourseSummaryDto) => void
}

export function CourseActionButtons({
  course,
  onToggleStar,
  onToggleHide,
}: CourseActionButtonsProps) {
  return (
    <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
      <button
        type="button"
        className="sf-btn sf-btn--ghost"
        aria-pressed={Boolean(course.isStarred)}
        aria-label={course.isStarred ? `Unstar ${course.title}` : `Star ${course.title}`}
        onClick={() => onToggleStar(course)}
      >
        <Star
          size={18}
          color={course.isStarred ? 'var(--accent)' : 'currentColor'}
          fill={course.isStarred ? 'var(--accent)' : 'none'}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        className="sf-btn sf-btn--ghost"
        aria-label={course.isHidden ? `Restore ${course.title} to view` : `Hide ${course.title} from view`}
        onClick={() => onToggleHide(course)}
      >
        {course.isHidden ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}
