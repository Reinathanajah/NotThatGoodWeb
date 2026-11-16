import { useCallback, useEffect, useState } from 'react'
import {
  fetchDashboardTimeline,
  type TimelineFilter,
  type TimelineSort,
} from '../services/dashboardApi.ts'
import type { TimelineItemDto } from '../types/courses.ts'

const PAGE_LIMIT = 8

export function useDashboardTimeline() {
  const [filter, setFilter] = useState<TimelineFilter>('all')
  const [sort, setSort] = useState<TimelineSort>('dates')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [items, setItems] = useState<TimelineItemDto[]>([])
  const [priorityItem, setPriorityItem] = useState<TimelineItemDto | null>(null)
  const [priorityReady, setPriorityReady] = useState(false)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 220)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    fetchDashboardTimeline(
      { filter, sort, search: debouncedSearch, offset: 0, limit: PAGE_LIMIT },
      controller.signal,
    ).then(
      (res) => {
        setItems(res.items)
        setTotal(res.pagination.total)
        setHasMore(Boolean(res.pagination.hasMore))
        if (filter === 'all' && !debouncedSearch) {
          const next =
            res.items.find((i) => i.status === 'overdue') ??
            res.items.find((i) => i.status === 'upcoming') ??
            null
          setPriorityItem(next)
          setPriorityReady(true)
        }
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load timeline')
        setPriorityReady(true)
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [filter, sort, debouncedSearch, reloadNonce])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetchDashboardTimeline({
        filter,
        sort,
        search: debouncedSearch,
        offset: items.length,
        limit: PAGE_LIMIT,
      })
      setItems((prev) => [...prev, ...res.items])
      setTotal(res.pagination.total)
      setHasMore(Boolean(res.pagination.hasMore))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load more activities')
    } finally {
      setLoadingMore(false)
    }
  }, [debouncedSearch, filter, hasMore, items.length, loadingMore, sort])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadNonce((prev) => prev + 1)
  }, [])

  const applyFilter = (next: TimelineFilter) => {
    setLoading(true)
    setFilter(next)
  }

  const applySort = (next: TimelineSort) => {
    setLoading(true)
    setSort(next)
  }

  return {
    filter,
    sort,
    searchInput,
    setSearchInput,
    applyFilter,
    applySort,
    items,
    priorityItem,
    priorityReady,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  }
}
