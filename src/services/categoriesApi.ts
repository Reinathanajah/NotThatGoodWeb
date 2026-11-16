import type { PaginationMeta } from '../types/api.ts'
import type { CourseSummaryDto } from '../types/courses.ts'
import type { CategoryDetailDto, CategoryNodeDto } from '../types/navigation.ts'
import { apiFetch, apiFetchWithMeta } from './apiClient.ts'

export interface CategoryCoursesQuery {
  includeSubcategories?: boolean
  search?: string
  page?: number
  limit?: number
}

export function fetchCategoryDirectoryTree(
  depth = 4,
  signal?: AbortSignal,
): Promise<CategoryNodeDto[]> {
  return apiFetch<CategoryNodeDto[]>(`/categories?view=tree&depth=${depth}`, { signal })
}

export function fetchCategoryDetail(
  categoryId: number,
  signal?: AbortSignal,
): Promise<CategoryDetailDto> {
  return apiFetch<CategoryDetailDto>(`/categories/${categoryId}`, { signal })
}

export async function fetchCategoryCourses(
  categoryId: number,
  query: CategoryCoursesQuery = {},
  signal?: AbortSignal,
): Promise<{ items: CourseSummaryDto[]; pagination: PaginationMeta }> {
  const params = new URLSearchParams()
  params.set('includeSubcategories', String(query.includeSubcategories ?? true))
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.page !== undefined) params.set('page', String(query.page))
  if (query.limit !== undefined) params.set('limit', String(query.limit))

  const result = await apiFetchWithMeta<CourseSummaryDto[]>(
    `/categories/${categoryId}/courses?${params.toString()}`,
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
