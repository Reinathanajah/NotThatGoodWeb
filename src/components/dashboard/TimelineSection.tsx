import './dashboard.css'
import { useAuth } from '../../context/authContextValue.ts'
import { useI18n } from '../../context/i18nContextValue.ts'
import { formatDateHeading } from '../../lib/dateFormat.ts'
import type { TimelineFilter, TimelineSort } from '../../services/dashboardApi.ts'
import type { TimelineItemDto } from '../../types/courses.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { TimelineRow } from './TimelineRow.tsx'
import { TimelineToolbar } from './TimelineToolbar.tsx'

interface TimelineSectionProps {
  filter: TimelineFilter
  sort: TimelineSort
  searchInput: string
  items: TimelineItemDto[]
  total: number
  hasMore: boolean
  loading: boolean
  loadingMore: boolean
  error: string | null
  onChangeFilter: (next: TimelineFilter) => void
  onChangeSort: (next: TimelineSort) => void
  onChangeSearch: (next: string) => void
  onLoadMore: () => Promise<void>
  onRetry: () => void
}

export function TimelineSection({
  filter,
  sort,
  searchInput,
  items,
  total,
  hasMore,
  loading,
  loadingMore,
  error,
  onChangeFilter,
  onChangeSort,
  onChangeSearch,
  onLoadMore,
  onRetry,
}: TimelineSectionProps) {
  const { user } = useAuth()
  const { strings, lang } = useI18n()
  const tz = user?.timezone ?? 'UTC'

  const getGroupHeading = (item: TimelineItemDto): string =>
    sort === 'courses' ? item.course.title : formatDateHeading(item.dueAt, tz, lang)

  return (
    <section
      className="sf-surface dash-section-card sf-stack"
      aria-labelledby="timeline-heading"
    >
      <TimelineToolbar
        title={strings.dashboard.timeline}
        shownCount={items.length}
        totalCount={total}
        filter={filter}
        sort={sort}
        searchInput={searchInput}
        onChangeFilter={onChangeFilter}
        onChangeSort={onChangeSort}
        onChangeSearch={onChangeSearch}
      />

      {error ? (
        <StatusBanner
          variant="error"
          title="Could not load timeline"
          message={error}
          actionLabel="Retry timeline"
          onAction={onRetry}
        />
      ) : loading ? (
        <StatusBanner variant="loading" title="Loading timeline activities" skeletonLines={4} />
      ) : items.length === 0 ? (
        <StatusBanner
          variant="empty"
          title="No activities in this view"
          message="Adjust your timeframe filter or search text to view other coursework."
          actionLabel={filter !== 'all' || searchInput ? 'Reset filters' : undefined}
          onAction={
            filter !== 'all' || searchInput
              ? () => {
                  onChangeFilter('all')
                  onChangeSearch('')
                }
              : undefined
          }
        />
      ) : (
        <div className="sf-stack" style={{ gap: 'var(--space-3)' }}>
          {items.map((item, idx) => {
            const heading = getGroupHeading(item)
            const prevHeading = idx > 0 ? getGroupHeading(items[idx - 1]) : null
            return (
              <div
                key={`${item.moduleType}-${item.moduleId}`}
                className="sf-stack"
                style={{ gap: 'var(--space-2)' }}
              >
                {heading !== prevHeading ? (
                  <h3 className="timeline-group-heading">{heading}</h3>
                ) : null}
                <TimelineRow item={item} timeZone={tz} />
              </div>
            )
          })}

          {hasMore ? (
            <div>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                disabled={loadingMore}
                onClick={() => void onLoadMore()}
              >
                {loadingMore ? 'Loading more...' : strings.dashboard.showMoreActivities}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
