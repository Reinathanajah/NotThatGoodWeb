import type { TimelineFilter, TimelineSort } from '../../services/dashboardApi.ts'

interface TimelineToolbarProps {
  title: string
  shownCount: number
  totalCount: number
  filter: TimelineFilter
  sort: TimelineSort
  searchInput: string
  onChangeFilter: (next: TimelineFilter) => void
  onChangeSort: (next: TimelineSort) => void
  onChangeSearch: (next: string) => void
}

export function TimelineToolbar({
  title,
  shownCount,
  totalCount,
  filter,
  sort,
  searchInput,
  onChangeFilter,
  onChangeSort,
  onChangeSearch,
}: TimelineToolbarProps) {
  return (
    <div className="dash-controls">
      <div className="sf-stack" style={{ gap: 'var(--space-1)' }}>
        <h2 id="timeline-heading" className="sf-heading-section">
          {title}
        </h2>
        <p className="sf-text-muted tabular-nums">
          Showing {shownCount} of {totalCount} activities
        </p>
      </div>

      <div className="sf-row" style={{ alignItems: 'flex-end' }}>
        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="timeline-filter" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Window
          </label>
          <select
            id="timeline-filter"
            className="dash-select"
            value={filter}
            onChange={(e) => onChangeFilter(e.target.value as TimelineFilter)}
          >
            <option value="all">All</option>
            <option value="overdue">Overdue</option>
            <option value="next_7_days">Next 7 days</option>
            <option value="next_30_days">Next 30 days</option>
          </select>
        </div>

        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="timeline-sort" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Sort order
          </label>
          <select
            id="timeline-sort"
            className="dash-select"
            value={sort}
            onChange={(e) => onChangeSort(e.target.value as TimelineSort)}
          >
            <option value="dates">Sort by dates</option>
            <option value="courses">Sort by courses</option>
          </select>
        </div>

        <div className="sf-stack" style={{ gap: '4px' }}>
          <label htmlFor="timeline-search" className="sf-text-muted" style={{ fontWeight: 600 }}>
            Filter activities
          </label>
          <input
            id="timeline-search"
            type="search"
            className="dash-search-input"
            placeholder="Search timeline..."
            value={searchInput}
            onChange={(e) => onChangeSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
