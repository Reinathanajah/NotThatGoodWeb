import { useCallback, useEffect, useState } from 'react'
import {
  fetchCategoryCourses,
  fetchCategoryDetail,
  fetchCategoryDirectoryTree,
} from '../services/categoriesApi.ts'
import type { CourseSummaryDto } from '../types/courses.ts'
import type { CategoryDetailDto, CategoryNodeDto } from '../types/navigation.ts'

export type CategoryPageSize = 12 | 24

export function useCategoryExplorer(categoryId: number) {
  const [trackedCategoryId, setTrackedCategoryId] = useState(categoryId)
  const [tree, setTree] = useState<CategoryNodeDto[]>([])
  const [detail, setDetail] = useState<CategoryDetailDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseSummaryDto[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [includeSubcategories, setIncludeSubcategories] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<CategoryPageSize>(12)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [detailNonce, setDetailNonce] = useState(0)
  const [coursesNonce, setCoursesNonce] = useState(0)

  if (trackedCategoryId !== categoryId) {
    setTrackedCategoryId(categoryId)
    setPage(1)
    setDetailLoading(true)
    setDetailError(null)
    setCoursesLoading(true)
    setCoursesError(null)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 220)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    fetchCategoryDirectoryTree(4, controller.signal).then(setTree, () => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchCategoryDetail(categoryId, controller.signal).then(
      (payload) => {
        setDetail(payload)
        setDetailError(null)
        setDetailLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setDetailError(err instanceof Error ? err.message : 'Unable to load category details')
        setDetailLoading(false)
      },
    )
    return () => controller.abort()
  }, [categoryId, detailNonce])

  useEffect(() => {
    const controller = new AbortController()
    fetchCategoryCourses(
      categoryId,
      { includeSubcategories, search: debouncedSearch, page, limit },
      controller.signal,
    ).then(
      (res) => {
        setCourses(res.items)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages ?? 1)
        setCoursesError(null)
        setCoursesLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setCoursesError(err instanceof Error ? err.message : 'Unable to load category courses')
        setCoursesLoading(false)
      },
    )
    return () => controller.abort()
  }, [categoryId, includeSubcategories, debouncedSearch, page, limit, coursesNonce])

  const changeSearch = useCallback((next: string) => {
    setSearchInput(next)
    setPage(1)
    setCoursesLoading(true)
  }, [])

  const toggleIncludeSubcategories = useCallback((next: boolean) => {
    setIncludeSubcategories(next)
    setPage(1)
    setCoursesLoading(true)
  }, [])

  const changeLimit = useCallback((next: CategoryPageSize) => {
    setLimit(next)
    setPage(1)
    setCoursesLoading(true)
  }, [])

  const changePage = useCallback((next: number) => {
    setPage(next)
    setCoursesLoading(true)
  }, [])

  const retryDetail = useCallback(() => {
    setDetailLoading(true)
    setDetailError(null)
    setDetailNonce((n) => n + 1)
  }, [])

  const retryCourses = useCallback(() => {
    setCoursesLoading(true)
    setCoursesError(null)
    setCoursesNonce((n) => n + 1)
  }, [])

  return {
    tree,
    detail,
    detailLoading,
    detailError,
    courses,
    coursesLoading,
    coursesError,
    includeSubcategories,
    searchInput,
    page,
    limit,
    total,
    totalPages,
    changeSearch,
    toggleIncludeSubcategories,
    changeLimit,
    changePage,
    retryDetail,
    retryCourses,
  }
}
