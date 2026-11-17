import type { PaginationMeta } from '../types/api.ts'
import type {
  ChatMessageDto,
  ConversationDetailDto,
  ConversationSummaryDto,
  NotificationsListDto,
} from '../types/workspace.ts'
import { apiFetch, apiFetchWithMeta } from './apiClient.ts'

export function publishUnreadCount(count: number): void {
  window.dispatchEvent(new CustomEvent<number>('sf:unread-count', { detail: count }))
}

export async function fetchNotificationsPage(
  unreadOnly: boolean,
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<{ data: NotificationsListDto; pagination: PaginationMeta | undefined }> {
  const qs = new URLSearchParams({
    unreadOnly: String(unreadOnly),
    page: String(page),
    limit: String(limit),
  })
  const res = await apiFetchWithMeta<NotificationsListDto>(`/notifications?${qs.toString()}`, {
    signal,
  })
  return { data: res.data, pagination: res.meta?.pagination }
}

export async function markNotificationRead(notificationId: string): Promise<number> {
  const res = await apiFetch<{ unreadCount: number }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
  publishUnreadCount(res.unreadCount)
  return res.unreadCount
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = await apiFetch<{ unreadCount: number }>('/notifications/read-all', {
    method: 'POST',
  })
  publishUnreadCount(res.unreadCount)
  return res.unreadCount
}

export function fetchConversationsList(signal?: AbortSignal): Promise<ConversationSummaryDto[]> {
  return apiFetch<ConversationSummaryDto[]>('/messages/conversations', { signal })
}

export async function fetchConversationThread(
  conversationId: string,
  offset = 0,
  limit = 30,
  signal?: AbortSignal,
): Promise<{ data: ConversationDetailDto; hasMore: boolean }> {
  const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) })
  const res = await apiFetchWithMeta<ConversationDetailDto>(
    `/messages/conversations/${conversationId}?${qs.toString()}`,
    { signal },
  )
  return { data: res.data, hasMore: Boolean(res.meta?.pagination?.hasMore) }
}

export function sendConversationMessage(
  conversationId: string,
  body: string,
): Promise<ChatMessageDto> {
  return apiFetch<ChatMessageDto>(`/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { body },
  })
}
