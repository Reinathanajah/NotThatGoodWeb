import type { PresenceStatusDto, SupportTicketDto } from '../types/workspace.ts'
import { apiFetch } from './apiClient.ts'

export function sendPresenceHeartbeat(signal?: AbortSignal): Promise<{
  userId: string
  lastSeenAt: string
  activeWindowSeconds: number
  onlineCount: number
}> {
  return apiFetch('/presence/heartbeat', {
    method: 'POST',
    signal,
    skipUnauthorizedEvent: true,
  })
}

export function fetchOnlinePresence(signal?: AbortSignal): Promise<PresenceStatusDto> {
  return apiFetch<PresenceStatusDto>('/presence/online', {
    signal,
    skipAuth: true,
    skipUnauthorizedEvent: true,
  })
}

export function createSupportTicket(input: {
  email?: string
  subject: string
  message: string
}): Promise<SupportTicketDto> {
  return apiFetch<SupportTicketDto>('/support/tickets', {
    method: 'POST',
    body: input,
    skipUnauthorizedEvent: true,
  })
}
