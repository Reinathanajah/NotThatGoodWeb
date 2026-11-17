export interface ApiErrorDetail {
  field?: string
  message: string
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: ApiErrorDetail[]
}

export interface PaginationMeta {
  page?: number
  limit: number
  offset?: number
  total: number
  totalPages?: number
  hasMore?: boolean
}

export interface ApiMeta {
  pagination?: PaginationMeta
  [key: string]: unknown
}

export interface ApiEnvelope<T> {
  ok: boolean
  data?: T
  meta?: ApiMeta
  error?: ApiErrorBody
}

export interface ApiResult<T> {
  data: T
  meta?: ApiMeta
}

export interface CategorySummaryDto {
  id: number
  moodleCategoryId?: number | null
  name: string
  slug: string
}

export interface BreadcrumbDto {
  id: number
  moodleCategoryId: number | null
  name: string
  slug: string
}

export interface AdjacentModuleLink {
  id: number
  moodleModuleId: number | null
  moduleType: string
  title: string
}

export interface AdjacentModulesDto {
  courseId: number
  prev: AdjacentModuleLink | null
  next: AdjacentModuleLink | null
}
