import '../categories/categories.css'
import { Award, ChevronRight, Star } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'wouter'
import { resolveCategoryHref, resolveCourseHref } from '../../lib/appRoutes.ts'
import type { CourseDetailDto } from '../../types/courses.ts'
import { SafeHtmlBlock } from '../ui/SafeHtmlBlock.tsx'

interface CourseDetailHeaderProps {
  course: CourseDetailDto
  togglingStar: boolean
  onToggleStar: () => void
}

export function CourseDetailHeader({
  course,
  togglingStar,
  onToggleStar,
}: CourseDetailHeaderProps) {
  const pct = course.completion.percentage
  const groupText =
    course.enrollment.groups.length > 0
      ? course.enrollment.groups.map((g) => g.name).join(', ')
      : null

  return (
    <header className="sf-surface cat-header-card sf-stack" aria-labelledby="course-detail-title">
      {course.breadcrumbs.length > 0 ? (
        <nav aria-label="Course breadcrumb">
          <ol className="cat-breadcrumb-list">
            {course.breadcrumbs.map((crumb, idx) => (
              <Fragment key={crumb.id}>
                <li className="cat-breadcrumb-item">
                  <Link href={resolveCategoryHref(crumb)}>{crumb.name}</Link>
                  {idx < course.breadcrumbs.length - 1 ? (
                    <ChevronRight size={16} aria-hidden="true" />
                  ) : null}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 320px' }}>
          <p className="sf-text-muted tabular-nums" style={{ fontWeight: 600 }}>
            {course.code}
            {course.term ? ` · ${course.term.label}` : ''}
            {groupText ? ` · ${groupText}` : ''}
          </p>
          <h1 id="course-detail-title" className="sf-heading-display">
            {course.title}
          </h1>
          {course.lecturers.length > 0 ? (
            <p className="sf-text-muted">
              Instructors:{' '}
              {course.lecturers
                .map((l) => (l.email ? `${l.fullName} (${l.email})` : l.fullName))
                .join(', ')}
            </p>
          ) : null}
        </div>

        <div className="sf-row">
          <Link
            href={`${resolveCourseHref(course)}/grades`}
            className="sf-btn sf-btn--secondary"
          >
            <Award size={18} aria-hidden="true" />
            <span>Course grades</span>
          </Link>

          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            aria-pressed={course.enrollment.isStarred}
            disabled={togglingStar}
            onClick={onToggleStar}
          >
            <Star
              size={18}
              color={course.enrollment.isStarred ? 'var(--accent)' : 'currentColor'}
              fill={course.enrollment.isStarred ? 'var(--accent)' : 'none'}
              aria-hidden="true"
            />
            <span>{course.enrollment.isStarred ? 'Starred' : 'Star course'}</span>
          </button>
        </div>
      </div>

      {pct !== null ? (
        <div className="sf-stack" style={{ gap: '6px', maxWidth: '420px' }}>
          <div className="sf-row" style={{ justifyContent: 'space-between' }}>
            <span className="sf-text-muted">Course progress</span>
            <strong className="tabular-nums">
              {pct}% ({course.completion.completedModules}/{course.completion.totalTrackableModules}{' '}
              modules)
            </strong>
          </div>
          <div className="course-progress-track" aria-hidden="true">
            <div className="course-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      {course.summaryHtml ? (
        <div className="course-callout" aria-label="Course syllabus notes">
          <SafeHtmlBlock html={course.summaryHtml} />
        </div>
      ) : null}
    </header>
  )
}
