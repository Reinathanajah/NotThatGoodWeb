import type { PaginationMeta } from '../types/api.ts'
import type { CourseSummaryDto, RecentCourseDto } from '../types/courses.ts'
import { apiFetch, apiFetchWithMeta } from './apiClient.ts'

export type CourseFilter = 'all' | 'in_progress' | 'future' | 'past' | 'starred' | 'hidden'
export type CourseSort = 'name' | 'last_accessed'
export type CourseView = 'list' | 'card' | 'summary'
export type CoursePageSize = 0 | 12 | 24 | 48

export interface MyCoursesQuery {
  filter?: CourseFilter
  search?: string
  sort?: CourseSort
  page?: number
  limit?: number
}

export async function fetchMyCourses(
  query: MyCoursesQuery = {},
  signal?: AbortSignal,
): Promise<{ items: CourseSummaryDto[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams()
  if (query.filter) params.set('filter', query.filter)
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.sort) params.set('sort', query.sort)
  if (query.page !== undefined) params.set('page', String(query.page))
  if (query.limit !== undefined) params.set('limit', String(query.limit))

  const result = await apiFetchWithMeta<CourseSummaryDto[]>(
    `/courses/my?${params.toString()}`,
    { signal },
  )

  return {
    items: result.data,
    pagination: result.meta?.pagination ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      total: result.data.length,
      totalPages: 1,
    },
  }
}

export function fetchRecentCourses(limit = 6, signal?: AbortSignal): Promise<RecentCourseDto[]> {
  return apiFetch<RecentCourseDto[]>(`/courses/recent?limit=${limit}`, { signal })
}

export function updateCoursePreference(
  courseId: number,
  patch: { isStarred?: boolean; isHidden?: boolean },
): Promise<{
  courseId: number
  moodleCourseId: number | null
  isStarred: boolean
  isHidden: boolean
}> {
  return apiFetch(`/courses/${courseId}/preference`, {
    method: 'PATCH',
    body: patch,
  })
}
