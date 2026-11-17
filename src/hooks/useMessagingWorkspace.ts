import { useCallback, useEffect, useState } from 'react'
import {
  fetchConversationsList,
  fetchConversationThread,
  sendConversationMessage,
} from '../services/commsApi.ts'
import type {
  ChatMessageDto,
  ConversationDetailDto,
  ConversationSummaryDto,
} from '../types/workspace.ts'

export function useMessagingWorkspace(initialConversationId?: string) {
  const [trackedParamId, setTrackedParamId] = useState(initialConversationId)
  const [conversations, setConversations] = useState<ConversationSummaryDto[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null)
  const [trackedThreadId, setTrackedThreadId] = useState<string | null>(selectedId)
  const [thread, setThread] = useState<ConversationDetailDto | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(Boolean(initialConversationId))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [threadError, setThreadError] = useState<string | null>(null)

  if (trackedParamId !== initialConversationId) {
    setTrackedParamId(initialConversationId)
    if (initialConversationId) setSelectedId(initialConversationId)
  }

  if (trackedThreadId !== selectedId) {
    setTrackedThreadId(selectedId)
    setThread(null)
    setThreadError(null)
    setHasMore(false)
    setLoadingThread(Boolean(selectedId))
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchConversationsList(controller.signal).then(
      (list) => {
        if (controller.signal.aborted) return
        setConversations(list)
        setSelectedId((prev) => prev ?? list[0]?.id ?? null)
        setError(null)
        setLoadingList(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load conversations')
        setLoadingList(false)
      },
    )
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const controller = new AbortController()
    fetchConversationThread(selectedId, 0, 30, controller.signal).then(
      ({ data, hasMore: more }) => {
        if (controller.signal.aborted) return
        setThread(data)
        setHasMore(more)
        setLoadingThread(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setThreadError(err instanceof Error ? err.message : 'Unable to load messages')
        setLoadingThread(false)
      },
    )
    return () => controller.abort()
  }, [selectedId])

  const loadOlder = useCallback(async () => {
    if (!selectedId || !thread || !hasMore || loadingThread) return
    const res = await fetchConversationThread(selectedId, thread.messages.length, 30)
    setThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, ...res.data.messages] } : prev,
    )
    setHasMore(res.hasMore)
  }, [selectedId, thread, hasMore, loadingThread])

  const sendMessage = useCallback(
    async (body: string): Promise<boolean> => {
      if (!selectedId || sending) return false
      setSending(true)
      setThreadError(null)
      try {
        const created: ChatMessageDto = await sendConversationMessage(selectedId, body)
        setThread((prev) =>
          prev ? { ...prev, messages: [...prev.messages, created] } : prev,
        )
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  lastMessage: {
                    id: created.id,
                    senderUserId: created.sender.id,
                    body: created.body,
                    createdAt: created.createdAt,
                  },
                }
              : c,
          ),
        )
        return true
      } catch (err: unknown) {
        setThreadError(err instanceof Error ? err.message : 'Failed to send message')
        return false
      } finally {
        setSending(false)
      }
    },
    [selectedId, sending],
  )

  return {
    conversations,
    selectedId,
    thread,
    hasMore,
    loadingList,
    loadingThread,
    sending,
    error,
    threadError,
    setSelectedId,
    loadOlder,
    sendMessage,
  }
}
