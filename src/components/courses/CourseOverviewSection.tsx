import './courses.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../../context/i18nContextValue.ts'
import { useCourseOverview } from '../../hooks/useCourseOverview.ts'
import type { CoursePageSize } from '../../services/coursesApi.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { CourseOverviewItem } from './CourseOverviewItem.tsx'
import { CourseOverviewToolbar } from './CourseOverviewToolbar.tsx'

export function CourseOverviewSection() {
  const { strings } = useI18n()
  const {
    filter,
    sort,
    view,
    pageSize,
    page,
    setPage,
    searchInput,
    setSearchInput,
    items,
    total,
    totalPages,
    loading,
    error,
    actionError,
    changeFilter,
    changeSort,
    changeView,
    changePageSize,
    toggleStar,
    toggleHide,
    retry,
  } = useCourseOverview()

  return (
    <section
      className="sf-surface dash-section-card sf-stack"
      aria-labelledby="course-overview-heading"
    >
      <CourseOverviewToolbar
        title={strings.dashboard.courseOverview}
        totalCount={total}
        filter={filter}
        sort={sort}
        view={view}
        searchInput={searchInput}
        onChangeFilter={changeFilter}
        onChangeSort={changeSort}
        onChangeView={changeView}
        onChangeSearch={setSearchInput}
      />

      {actionError ? (
        <StatusBanner variant="error" title="Preference update failed" message={actionError} />
      ) : null}

      {error ? (
        <StatusBanner
          variant="error"
          title="Could not load courses"
          message={error}
          actionLabel="Retry courses"
          onAction={retry}
        />
      ) : loading ? (
        <StatusBanner variant="loading" title="Loading enrolled courses" skeletonLines={4} />
      ) : items.length === 0 ? (
        <StatusBanner
          variant="empty"
          title="No courses in this view"
          message={
            filter !== 'all' || searchInput
              ? 'Change your status filter or clear the search box to see enrolled courses.'
              : 'You are not enrolled in any active courses yet. Browse faculties in navigation to explore courses.'
          }
          actionLabel={filter !== 'all' || searchInput ? 'Show all courses' : undefined}
          onAction={
            filter !== 'all' || searchInput
              ? () => {
                  changeFilter('all')
                  setSearchInput('')
                }
              : undefined
          }
        />
      ) : (
        <div className={view === 'card' ? 'courses-grid' : 'sf-stack'}>
          {items.map((course) => (
            <CourseOverviewItem
              key={course.id}
              course={course}
              view={view}
              onToggleStar={(target) => void toggleStar(target)}
              onToggleHide={(target) => void toggleHide(target)}
            />
          ))}
        </div>
      )}

      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <div className="sf-row">
          <label htmlFor="course-page-size" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Show
          </label>
          <select
            id="course-page-size"
            className="dash-select"
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value) as CoursePageSize)}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={0}>All</option>
          </select>
        </div>

        <div className="sf-row">
          <span className="sf-text-muted tabular-nums">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            aria-label="Previous courses page"
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            aria-label="Next courses page"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
