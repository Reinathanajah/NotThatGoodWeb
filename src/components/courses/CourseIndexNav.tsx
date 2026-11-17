import './courseIndex.css'
import { useState } from 'react'
import type { CourseSectionDto } from '../../types/courses.ts'

interface CourseIndexNavProps {
  sections: CourseSectionDto[]
  onJumpSection: (sectionId: number) => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function CourseIndexNav({
  sections,
  onJumpSection,
  onExpandAll,
  onCollapseAll,
}: CourseIndexNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <aside className="sf-surface course-index-panel sf-stack" aria-label="Course index">
      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <h2 className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
          Course index
        </h2>
        <button
          type="button"
          className="sf-btn sf-btn--secondary course-index-mobile-btn"
          aria-expanded={mobileOpen}
          aria-controls="course-index-list"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? 'Hide index' : 'Browse index'}
        </button>
      </div>

      <div
        id="course-index-list"
        className={`sf-stack${mobileOpen ? '' : ' course-index-list--collapsed'}`}
        style={{ gap: 'var(--space-2)' }}
      >
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <button type="button" className="sf-btn sf-btn--ghost" onClick={onExpandAll}>
            Expand all
          </button>
          <button type="button" className="sf-btn sf-btn--ghost" onClick={onCollapseAll}>
            Collapse all
          </button>
        </div>

        <nav className="sf-stack" style={{ gap: '2px' }} aria-label="Course sections jump list">
          {sections.map((sec) => {
            const trackable = sec.modules.filter((m) => m.completionTrackable)
            const doneCount = trackable.filter((m) => m.isCompleted).length
            return (
              <button
                key={sec.id}
                type="button"
                className="course-index-item"
                onClick={() => {
                  onJumpSection(sec.id)
                  setMobileOpen(false)
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sec.title}</span>
                {trackable.length > 0 ? (
                  <span className="sf-text-muted tabular-nums" style={{ flexShrink: 0 }}>
                    {doneCount}/{trackable.length}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
