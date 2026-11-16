import './courses.css'
import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { useI18n } from '../../context/i18nContextValue.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { resolveCourseHref } from '../../lib/appRoutes.ts'
import { fetchRecentCourses } from '../../services/coursesApi.ts'
import type { RecentCourseDto } from '../../types/courses.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { CourseArtwork } from './CourseArtwork.tsx'

export function RecentlyAccessedSection() {
  const { user } = useAuth()
  const { strings } = useI18n()
  const [items, setItems] = useState<RecentCourseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const tz = user?.timezone ?? 'UTC'

  useEffect(() => {
    const controller = new AbortController()
    fetchRecentCourses(6, controller.signal).then(
      (data) => {
        setItems(data)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load recent courses')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [nonce])

  return (
    <section
      className="sf-surface dash-section-card sf-stack"
      aria-labelledby="recent-courses-heading"
    >
      <h2 id="recent-courses-heading" className="sf-heading-section">
        {strings.dashboard.recentlyAccessed}
      </h2>

      {error ? (
        <StatusBanner
          variant="error"
          title="Could not load recent courses"
          message={`${error} Check your connection and try reloading.`}
          actionLabel="Retry recent courses"
          onAction={() => {
            setLoading(true)
            setError(null)
            setNonce((prev) => prev + 1)
          }}
        />
      ) : loading ? (
        <StatusBanner variant="loading" title="Loading recent courses" skeletonLines={2} />
      ) : items.length === 0 ? (
        <StatusBanner
          variant="empty"
          title="No recently accessed courses"
          message="Open any course from Course overview to track recent visits."
        />
      ) : (
        <div className="recent-courses-rail">
          {items.map((course) => {
            const href = resolveCourseHref(course)
            return (
              <article key={course.id} className="course-card">
                <Link href={href} aria-label={`Open ${course.title}`}>
                  <CourseArtwork courseId={course.id} code={course.code} className="course-artwork" />
                </Link>
                <div className="course-card-body">
                  <Link href={href} className="course-link-title">
                    {course.title}
                  </Link>
                  <p className="sf-text-muted tabular-nums">
                    {course.termLabel ?? course.categoryName ?? course.code} ·{' '}
                    {formatDateTimeShort(course.lastAccessedAt, tz)}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
