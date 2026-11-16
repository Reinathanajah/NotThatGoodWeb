import type {
  CourseFilter,
  CourseSort,
  CourseView,
} from '../../services/coursesApi.ts'

interface CourseOverviewToolbarProps {
  title: string
  totalCount: number
  filter: CourseFilter
  sort: CourseSort
  view: CourseView
  searchInput: string
  onChangeFilter: (next: CourseFilter) => void
  onChangeSort: (next: CourseSort) => void
  onChangeView: (next: CourseView) => void
  onChangeSearch: (next: string) => void
}

export function CourseOverviewToolbar({
  title,
  totalCount,
  filter,
  sort,
  view,
  searchInput,
  onChangeFilter,
  onChangeSort,
  onChangeView,
  onChangeSearch,
}: CourseOverviewToolbarProps) {
  return (
    <div className="dash-controls">
      <div className="sf-stack" style={{ gap: 'var(--space-1)' }}>
        <h2 id="course-overview-heading" className="sf-heading-section">
          {title}
        </h2>
        <p className="sf-text-muted tabular-nums">{totalCount} enrolled courses matching filter</p>
      </div>

      <div className="sf-row" style={{ alignItems: 'flex-end' }}>
        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="course-filter" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Status filter
          </label>
          <select
            id="course-filter"
            className="dash-select"
            value={filter}
            onChange={(e) => onChangeFilter(e.target.value as CourseFilter)}
          >
            <option value="all">All</option>
            <option value="in_progress">In progress</option>
            <option value="future">Future</option>
            <option value="past">Past</option>
            <option value="starred">Starred</option>
            <option value="hidden">Removed from view</option>
          </select>
        </div>

        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="course-search" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            className="dash-search-input"
            placeholder="Filter courses..."
            value={searchInput}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
        </div>

        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="course-sort" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Sort by
          </label>
          <select
            id="course-sort"
            className="dash-select"
            value={sort}
            onChange={(e) => onChangeSort(e.target.value as CourseSort)}
          >
            <option value="name">Sort by course name</option>
            <option value="last_accessed">Sort by last accessed</option>
          </select>
        </div>

        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="course-view" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Layout
          </label>
          <select
            id="course-view"
            className="dash-select"
            value={view}
            onChange={(e) => onChangeView(e.target.value as CourseView)}
          >
            <option value="card">Card</option>
            <option value="list">List</option>
            <option value="summary">Summary</option>
          </select>
        </div>
      </div>
    </div>
  )
}
