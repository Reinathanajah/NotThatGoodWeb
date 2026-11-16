import './dashboard.css'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { useI18n } from '../../context/i18nContextValue.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { resolveCategoryHref, resolveModuleHref } from '../../lib/appRoutes.ts'
import type { TimelineItemDto } from '../../types/courses.ts'
import { HorizonStage3D } from '../horizon3d/HorizonStage3D.tsx'
import type { FacultyBeacon } from '../horizon3d/campusGeometry.ts'
import { HeroSearchCapsule } from '../search/HeroSearchCapsule.tsx'

interface DashboardHeroProps {
  priorityItem: TimelineItemDto | null
  timelineLoaded: boolean
}

export function DashboardHero({ priorityItem, timelineLoaded }: DashboardHeroProps) {
  const { user } = useAuth()
  const { strings } = useI18n()
  const [, setLocation] = useLocation()
  const [focusedFaculty, setFocusedFaculty] = useState<FacultyBeacon | null>(null)

  const tz = user?.timezone ?? 'UTC'
  const firstName = user?.fullName.split(/\s+/)[0] ?? 'Student'
  const facultyLabel = user?.faculty?.name ?? 'SilverFour Campus'
  const programLabel = user?.program?.name ?? 'Active term workspace'

  return (
    <section className="dash-hero-grid" aria-labelledby="dash-greeting-title">
      <div className="sf-surface dash-hero-intro">
        <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
          <p className="sf-text-muted">
            {facultyLabel} · {programLabel}
          </p>
          <h1 id="dash-greeting-title" className="sf-heading-display">
            Welcome back, {firstName}
          </h1>
          <HeroSearchCapsule />
        </div>

        <div
          className={`dash-focus-card${priorityItem?.status === 'overdue' ? ' dash-focus-card--overdue' : ''}`}
          aria-label="Priority activity focus"
        >
          {!timelineLoaded ? (
            <p className="sf-text-muted">Checking upcoming deadlines...</p>
          ) : priorityItem ? (
            <>
              <div className="sf-row" style={{ justifyContent: 'space-between' }}>
                <span
                  className={priorityItem.status === 'overdue' ? 'timeline-overdue-pill' : undefined}
                  style={
                    priorityItem.status === 'overdue'
                      ? undefined
                      : { fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent)' }
                  }
                >
                  {priorityItem.status === 'overdue'
                    ? strings.dashboard.overdueBadge
                    : 'Next due'}
                </span>
                <span className="sf-text-muted tabular-nums">
                  {formatDateTimeShort(priorityItem.dueAt, tz)}
                </span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{priorityItem.title}</p>
              <div className="sf-row" style={{ justifyContent: 'space-between' }}>
                <span className="sf-text-muted">{priorityItem.course.title}</span>
                <Link
                  href={resolveModuleHref(priorityItem)}
                  className="sf-btn sf-btn--primary"
                >
                  Open activity
                </Link>
              </div>
            </>
          ) : (
            <p className="sf-text-muted">No pending or overdue deadlines on your timeline.</p>
          )}
        </div>
      </div>

      <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        <HorizonStage3D
          compact
          onSelectFaculty={(beacon) => {
            setFocusedFaculty(beacon)
          }}
        />
        {focusedFaculty ? (
          <div className="sf-row" style={{ justifyContent: 'space-between' }}>
            <span className="sf-text-muted">Selected beacon: {focusedFaculty.name}</span>
            <button
              type="button"
              className="sf-btn sf-btn--secondary"
              onClick={() =>
                setLocation(
                  resolveCategoryHref({ id: focusedFaculty.moodleCategoryId, moodleCategoryId: focusedFaculty.moodleCategoryId }),
                )
              }
            >
              Open {focusedFaculty.code} directory
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
