import { Link } from 'wouter'
import { resolveCourseHref } from '../../lib/appRoutes.ts'
import type { CourseSummaryDto } from '../../types/courses.ts'
import { CourseArtwork } from '../courses/CourseArtwork.tsx'

interface CategoryCourseCardProps {
  course: CourseSummaryDto
}

export function CategoryCourseCard({ course }: CategoryCourseCardProps) {
  const href = resolveCourseHref(course)
  const termLabel = course.term?.label ?? course.category?.name ?? course.format

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
          <p className="sf-text-muted">{termLabel}</p>
          <p className="sf-text-muted">
            {course.isEnrolled ? 'Enrolled' : `Syllabus preview · ${course.format}`}
          </p>
        </div>

        <div className="sf-row" style={{ justifyContent: 'space-between' }}>
          <span className="sf-text-muted tabular-nums" style={{ fontWeight: 600 }}>
            {course.code}
          </span>
          <Link
            href={href}
            className={course.isEnrolled ? 'sf-btn sf-btn--primary' : 'sf-btn sf-btn--secondary'}
          >
            {course.isEnrolled ? 'Open course' : 'View syllabus'}
          </Link>
        </div>
      </div>
    </article>
  )
}
