import { useCallback, useEffect, useState } from 'react'
import {
  fetchNotificationsPage,
  markAllNotificationsRead,
  markNotificationRead,
  publishUnreadCount,
} from '../services/commsApi.ts'
import type { PaginationMeta } from '../types/api.ts'
import type { NotificationItemDto } from '../types/workspace.ts'

export function useNotificationsFeed() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<NotificationItemDto[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchNotificationsPage(unreadOnly, page, 20, controller.signal).then(
      (res) => {
        if (controller.signal.aborted) return
        setItems(res.data.items)
        setUnreadCount(res.data.unreadCount)
        publishUnreadCount(res.data.unreadCount)
        setPagination(res.pagination ?? null)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load notifications')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [unreadOnly, page, nonce])

  const changeFilter = useCallback((nextUnread: boolean) => {
    setUnreadOnly(nextUnread)
    setPage(1)
    setLoading(true)
  }, [])

  const changePage = useCallback((nextPage: number) => {
    setPage(nextPage)
    setLoading(true)
  }, [])

  const markRead = useCallback(
    async (id: string) => {
      setBusyId(id)
      try {
        const nextUnread = await markNotificationRead(id)
        setUnreadCount(nextUnread)
        setItems((prev) =>
          unreadOnly
            ? prev.filter((n) => n.id !== id)
            : prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        )
      } finally {
        setBusyId(null)
      }
    },
    [unreadOnly],
  )

  const markAll = useCallback(async () => {
    setMarkingAll(true)
    try {
      const nextUnread = await markAllNotificationsRead()
      setUnreadCount(nextUnread)
      setItems((prev) => (unreadOnly ? [] : prev.map((n) => ({ ...n, isRead: true }))))
    } finally {
      setMarkingAll(false)
    }
  }, [unreadOnly])

  return {
    unreadOnly,
    page,
    items,
    unreadCount,
    pagination,
    loading,
    error,
    busyId,
    markingAll,
    changeFilter,
    changePage,
    markRead,
    markAll,
    retry: () => {
      setLoading(true)
      setNonce((n) => n + 1)
    },
  }
}
