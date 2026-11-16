import type { PaginationMeta } from '../types/api.ts'
import type { TimelineItemDto } from '../types/courses.ts'
import { apiFetchWithMeta } from './apiClient.ts'

export type TimelineFilter = 'all' | 'overdue' | 'next_7_days' | 'next_30_days'
export type TimelineSort = 'dates' | 'courses'

export interface TimelineQuery {
  filter?: TimelineFilter
  sort?: TimelineSort
  search?: string
  offset?: number
  limit?: number
}

export async function fetchDashboardTimeline(
  query: TimelineQuery = {},
  signal?: AbortSignal,
): Promise<{ items: TimelineItemDto[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams()
  if (query.filter) params.set('filter', query.filter)
  if (query.sort) params.set('sort', query.sort)
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.offset !== undefined) params.set('offset', String(query.offset))
  if (query.limit !== undefined) params.set('limit', String(query.limit))

  const result = await apiFetchWithMeta<TimelineItemDto[]>(
    `/dashboard/timeline?${params.toString()}`,
    { signal },
  )

  return {
    items: result.data,
    pagination: result.meta?.pagination ?? {
      offset: query.offset ?? 0,
      limit: query.limit ?? 10,
      total: result.data.length,
      hasMore: false,
    },
  }
}
