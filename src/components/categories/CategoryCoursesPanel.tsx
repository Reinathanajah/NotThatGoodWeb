import '../courses/courses.css'
import type { CategoryPageSize } from '../../hooks/useCategoryExplorer.ts'
import type { CourseSummaryDto } from '../../types/courses.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { CategoryCourseCard } from './CategoryCourseCard.tsx'
import { CategoryCoursesPagination } from './CategoryCoursesPagination.tsx'

interface CategoryCoursesPanelProps {
  courses: CourseSummaryDto[]
  loading: boolean
  error: string | null
  searchInput: string
  includeSubcategories: boolean
  page: number
  totalPages: number
  total: number
  limit: CategoryPageSize
  onChangeSearch: (next: string) => void
  onToggleIncludeSubcategories: (next: boolean) => void
  onChangeLimit: (next: CategoryPageSize) => void
  onChangePage: (next: number) => void
  onRetry: () => void
}

export function CategoryCoursesPanel({
  courses,
  loading,
  error,
  searchInput,
  includeSubcategories,
  page,
  totalPages,
  total,
  limit,
  onChangeSearch,
  onToggleIncludeSubcategories,
  onChangeLimit,
  onChangePage,
  onRetry,
}: CategoryCoursesPanelProps) {
  return (
    <section className="sf-surface dash-section-card sf-stack" aria-labelledby="cat-courses-heading">
      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)' }}>
          <h2 id="cat-courses-heading" className="sf-heading-section">
            Courses in category
          </h2>
          <p className="sf-text-muted tabular-nums">{total} courses matching current filters</p>
        </div>

        <div className="sf-row" style={{ alignItems: 'flex-end' }}>
          <div className="sf-stack" style={{ gap: '4px' }}>
            <label htmlFor="cat-course-search" className="sf-text-muted" style={{ fontWeight: 600 }}>
              Search category
            </label>
            <input
              id="cat-course-search"
              type="search"
              className="dash-search-input"
              placeholder="Title, code, or topic..."
              value={searchInput}
              onChange={(e) => onChangeSearch(e.target.value)}
            />
          </div>

          <label className="cat-check-label">
            <input
              type="checkbox"
              checked={includeSubcategories}
              onChange={(e) => onToggleIncludeSubcategories(e.target.checked)}
            />
            <span>Include subcategories</span>
          </label>
        </div>
      </div>

      {error ? (
        <StatusBanner
          variant="error"
          title="Could not load category courses"
          message={error}
          actionLabel="Retry courses"
          onAction={onRetry}
        />
      ) : loading ? (
        <StatusBanner variant="loading" title="Loading category courses" skeletonLines={4} />
      ) : courses.length === 0 ? (
        <StatusBanner
          variant="empty"
          title="No courses in this category"
          message={
            searchInput || !includeSubcategories
              ? 'Clear the search filter or include subcategories to view courses under nested programs.'
              : 'No visible courses are published under this directory node yet.'
          }
          actionLabel={searchInput || !includeSubcategories ? 'Reset filters' : undefined}
          onAction={
            searchInput || !includeSubcategories
              ? () => {
                  onChangeSearch('')
                  onToggleIncludeSubcategories(true)
                }
              : undefined
          }
        />
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CategoryCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <CategoryCoursesPagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        loading={loading}
        onChangeLimit={onChangeLimit}
        onChangePage={onChangePage}
      />
    </section>
  )
}
