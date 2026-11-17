import { Link } from 'wouter'
import { resolveCourseHref } from '../../lib/appRoutes.ts'
import type { CourseView } from '../../services/coursesApi.ts'
import type { CourseSummaryDto } from '../../types/courses.ts'
import { CourseActionButtons } from './CourseActionButtons.tsx'
import { CourseArtwork } from './CourseArtwork.tsx'

interface CourseOverviewItemProps {
  course: CourseSummaryDto
  view: CourseView
  onToggleStar: (course: CourseSummaryDto) => void
  onToggleHide: (course: CourseSummaryDto) => void
}

export function CourseOverviewItem({
  course,
  view,
  onToggleStar,
  onToggleHide,
}: CourseOverviewItemProps) {
  const href = resolveCourseHref(course)
  const pct = course.completion?.percentage ?? null
  const termText = course.term?.label ?? course.category?.name ?? 'Active curriculum'

  if (view === 'card') {
    return (
      <article className="course-card">
        <Link href={href} aria-label={`Open ${course.title}`}>
          <CourseArtwork courseId={course.id} code={course.code} className="course-artwork" />
        </Link>

        <div className="course-card-body">
          <div className="sf-stack" style={{ gap: '4px' }}>
            <Link href={href} className="course-link-title">
              {course.title}
            </Link>
            <p className="sf-text-muted">{termText}</p>
          </div>

          <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
            {pct !== null ? (
              <div className="sf-stack" style={{ gap: '4px' }}>
                <div className="course-progress-track" aria-hidden="true">
                  <div className="course-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="sf-text-muted tabular-nums">{pct}% complete</span>
              </div>
            ) : null}

            <div className="sf-row" style={{ justifyContent: 'space-between' }}>
              <span className="sf-text-muted tabular-nums" style={{ fontWeight: 600 }}>
                {course.code}
              </span>
              <CourseActionButtons
                course={course}
                onToggleStar={onToggleStar}
                onToggleHide={onToggleHide}
              />
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="course-list-row motion-surface">
      <div className="sf-row" style={{ flex: '1 1 280px', alignItems: 'center' }}>
        <Link href={href} className="course-swatch" aria-label={`Open ${course.title}`}>
          <CourseArtwork courseId={course.id} code={course.code} className="course-artwork" />
        </Link>

        <div className="sf-stack" style={{ gap: '4px', flex: 1 }}>
          <Link href={href} className="course-link-title">
            {course.title}
          </Link>
          <p className="sf-text-muted">
            {termText}
            {view === 'summary' && course.category ? ` · ${course.category.name}` : ''}
          </p>
          {pct !== null ? (
            <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
              <div className="course-progress-track" style={{ maxWidth: '180px' }} aria-hidden="true">
                <div className="course-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="sf-text-muted tabular-nums">{pct}% complete</span>
            </div>
          ) : null}
        </div>
      </div>

      <CourseActionButtons
        course={course}
        onToggleStar={onToggleStar}
        onToggleHide={onToggleHide}
      />
    </article>
  )
}
