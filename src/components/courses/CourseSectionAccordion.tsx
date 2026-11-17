import { ChevronDown, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/authContextValue.ts'
import { useI18n } from '../../context/i18nContextValue.ts'
import { formatDateHeading } from '../../lib/dateFormat.ts'
import type { CourseSectionDto } from '../../types/courses.ts'
import { CourseModuleRow } from './CourseModuleRow.tsx'

interface CourseSectionAccordionProps {
  courseId: number
  section: CourseSectionDto
  collapsed: boolean
  pendingModules: Set<number>
  onToggle: (sectionId: number) => void
  onToggleComplete: (moduleId: number, nextCompleted: boolean) => void
}

export function CourseSectionAccordion({
  courseId,
  section,
  collapsed,
  pendingModules,
  onToggle,
  onToggleComplete,
}: CourseSectionAccordionProps) {
  const { user } = useAuth()
  const { lang } = useI18n()
  const trackable = section.modules.filter((m) => m.completionTrackable)
  const doneCount = trackable.filter((m) => m.isCompleted).length
  const tz = user?.timezone ?? 'UTC'

  return (
    <section
      id={`course-sec-${section.id}`}
      className="sf-surface course-section-card"
      aria-labelledby={`sec-btn-${section.id}`}
    >
      <button
        id={`sec-btn-${section.id}`}
        type="button"
        className="course-section-trigger"
        aria-expanded={!collapsed}
        aria-controls={`sec-body-${section.id}`}
        onClick={() => onToggle(section.id)}
      >
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          {collapsed ? (
            <ChevronRight size={18} aria-hidden="true" />
          ) : (
            <ChevronDown size={18} aria-hidden="true" />
          )}
          <span style={{ fontWeight: 700, fontSize: 'var(--text-h3)' }}>{section.title}</span>
        </div>

        <span className="sf-text-muted tabular-nums">
          {section.modules.length} items
          {trackable.length > 0 ? ` · ${doneCount}/${trackable.length} done` : ''}
        </span>
      </button>

      {!collapsed ? (
        <div id={`sec-body-${section.id}`} className="course-section-body sf-stack">
          {section.weekStart && section.weekEnd ? (
            <p className="sf-text-muted" style={{ paddingTop: 'var(--space-3)' }}>
              {formatDateHeading(section.weekStart, tz, lang)} to{' '}
              {formatDateHeading(section.weekEnd, tz, lang)}
            </p>
          ) : null}

          {section.summaryText ? (
            <p className="sf-text-muted" style={{ paddingTop: 'var(--space-2)' }}>
              {section.summaryText}
            </p>
          ) : null}

          {section.modules.length === 0 ? (
            <p className="sf-text-muted" style={{ paddingTop: 'var(--space-3)' }}>
              No activities have been published in this section yet.
            </p>
          ) : (
            <div className="sf-stack" style={{ gap: 'var(--space-2)', paddingTop: 'var(--space-3)' }}>
              {section.modules.map((mod) => (
                <CourseModuleRow
                  key={mod.id}
                  courseId={courseId}
                  mod={mod}
                  pending={pendingModules.has(mod.id)}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
