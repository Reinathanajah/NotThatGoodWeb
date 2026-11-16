import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/authContextValue.ts'
import {
  fetchMyCourses,
  updateCoursePreference,
  type CourseFilter,
  type CoursePageSize,
  type CourseSort,
  type CourseView,
} from '../services/coursesApi.ts'
import { updateMyPreferences } from '../services/navigationApi.ts'
import type { CourseSummaryDto } from '../types/courses.ts'

export function useCourseOverview() {
  const { user, refreshProfile } = useAuth()
  const prefs = user?.preferences

  const [filter, setFilter] = useState<CourseFilter>(() => prefs?.courseOverviewFilter ?? 'all')
  const [sort, setSort] = useState<CourseSort>(() => prefs?.courseOverviewSort ?? 'name')
  const [view, setView] = useState<CourseView>(() => prefs?.courseOverviewView ?? 'card')
  const [pageSize, setPageSize] = useState<CoursePageSize>(() => prefs?.courseOverviewPageSize ?? 12)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [items, setItems] = useState<CourseSummaryDto[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 220)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    fetchMyCourses(
      { filter, search: debouncedSearch, sort, page, limit: pageSize },
      controller.signal,
    ).then(
      (res) => {
        setItems(res.items)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages ?? 1)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load enrolled courses')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [filter, sort, page, pageSize, debouncedSearch, nonce])

  const savePrefs = (patch: Parameters<typeof updateMyPreferences>[0]) => {
    updateMyPreferences(patch).then(
      () => refreshProfile(),
      () => {},
    )
  }

  const toggleStar = useCallback(
    async (course: CourseSummaryDto) => {
      const nextStarred = !course.isStarred
      setActionError(null)
      setItems((prev) =>
        prev
          .map((c) => (c.id === course.id ? { ...c, isStarred: nextStarred } : c))
          .filter((c) => (filter === 'starred' ? c.isStarred : true)),
      )
      try {
        await updateCoursePreference(course.id, { isStarred: nextStarred })
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : 'Failed to update star state')
        setNonce((n) => n + 1)
      }
    },
    [filter],
  )

  const toggleHide = useCallback(async (course: CourseSummaryDto) => {
    setActionError(null)
    setItems((prev) => prev.filter((c) => c.id !== course.id))
    try {
      await updateCoursePreference(course.id, { isHidden: !course.isHidden })
      setNonce((n) => n + 1)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to update course visibility')
      setNonce((n) => n + 1)
    }
  }, [])

  return {
    filter,
    sort,
    view,
    pageSize,
    page,
    setPage: (next: number) => {
      setLoading(true)
      setPage(next)
    },
    searchInput,
    setSearchInput,
    items,
    total,
    totalPages,
    loading,
    error,
    actionError,
    changeFilter: (next: CourseFilter) => {
      setLoading(true)
      setPage(1)
      setFilter(next)
      savePrefs({ courseOverviewFilter: next })
    },
    changeSort: (next: CourseSort) => {
      setLoading(true)
      setPage(1)
      setSort(next)
      savePrefs({ courseOverviewSort: next })
    },
    changeView: (next: CourseView) => {
      setView(next)
      savePrefs({ courseOverviewView: next })
    },
    changePageSize: (next: CoursePageSize) => {
      setLoading(true)
      setPage(1)
      setPageSize(next)
      savePrefs({ courseOverviewPageSize: next })
    },
    toggleStar,
    toggleHide,
    retry: () => {
      setLoading(true)
      setError(null)
      setNonce((n) => n + 1)
    },
  }
}
