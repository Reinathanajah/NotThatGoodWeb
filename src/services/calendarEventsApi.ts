import type { CalendarEventDto, CreateCalendarEventInput } from '../types/calendar.ts'
import { apiFetch } from './apiClient.ts'

export function createPersonalCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<CalendarEventDto> {
  return apiFetch<CalendarEventDto>('/calendar/events', {
    method: 'POST',
    body: { ...input, scope: 'user' },
  })
}

export function deletePersonalCalendarEvent(eventId: string): Promise<{ deletedId: string }> {
  return apiFetch<{ deletedId: string }>(`/calendar/events/${eventId}`, {
    method: 'DELETE',
  })
}
