import '../resources/resources.css'
import { Link } from 'wouter'
import { resolveCourseHref, resolveModuleHref } from '../../lib/appRoutes.ts'
import type { AdjacentModulesDto } from '../../types/api.ts'

interface ActivityNavigationRailProps {
  course: { id: number; moodleCourseId: number | null; title?: string }
  navigation: AdjacentModulesDto
}

export function ActivityNavigationRail({ course, navigation }: ActivityNavigationRailProps) {
  const prevHref = navigation.prev
    ? resolveModuleHref({ ...navigation.prev, courseId: course.id })
    : null
  const nextHref = navigation.next
    ? resolveModuleHref({ ...navigation.next, courseId: course.id })
    : null
  const courseHref = resolveCourseHref(course)

  return (
    <nav className="sf-surface res-rail" aria-label="Activity navigation">
      <div className="res-rail-slot res-rail-slot--start">
        {prevHref && navigation.prev ? (
          <Link href={prevHref} className="sf-btn sf-btn--secondary">
            Previous: {navigation.prev.title}
          </Link>
        ) : (
          <span className="sf-text-muted">Start of course activities</span>
        )}
      </div>

      <div className="res-rail-slot res-rail-slot--center">
        <Link href={courseHref} className="sf-btn sf-btn--ghost">
          Back to course
        </Link>
      </div>

      <div className="res-rail-slot res-rail-slot--end">
        {nextHref && navigation.next ? (
          <Link href={nextHref} className="sf-btn sf-btn--primary">
            Next: {navigation.next.title}
          </Link>
        ) : (
          <span className="sf-text-muted">End of course activities</span>
        )}
      </div>
    </nav>
  )
}
