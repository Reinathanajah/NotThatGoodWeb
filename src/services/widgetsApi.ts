import type { CalendarViewDto } from '../types/calendar.ts'
import type { LearnerScriptListDto } from '../types/reports.ts'
import type { ClockResponseDto } from '../types/workspace.ts'
import { apiFetch } from './apiClient.ts'

export function fetchClockStatus(
  params: { targetTimezone?: string; timestamp?: string } = {},
  signal?: AbortSignal,
): Promise<ClockResponseDto> {
  const qs = new URLSearchParams()
  if (params.targetTimezone) qs.set('targetTimezone', params.targetTimezone)
  if (params.timestamp) qs.set('timestamp', params.timestamp)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return apiFetch<ClockResponseDto>(`/clock${suffix}`, { signal })
}

export function fetchCalendarEvents(
  params: {
    view?: 'month' | 'day' | 'upcoming'
    year?: number
    month?: number
    day?: number
    courseId?: number
    includeHiddenScopes?: boolean
  } = {},
  signal?: AbortSignal,
): Promise<CalendarViewDto> {
  const qs = new URLSearchParams()
  if (params.view) qs.set('view', params.view)
  if (params.year !== undefined) qs.set('year', String(params.year))
  if (params.month !== undefined) qs.set('month', String(params.month))
  if (params.day !== undefined) qs.set('day', String(params.day))
  if (params.courseId !== undefined) qs.set('courseId', String(params.courseId))
  if (params.includeHiddenScopes !== undefined) {
    qs.set('includeHiddenScopes', String(params.includeHiddenScopes))
  }
  return apiFetch<CalendarViewDto>(`/calendar/events?${qs.toString()}`, { signal })
}

export function fetchLearnerScriptList(signal?: AbortSignal): Promise<LearnerScriptListDto> {
  return apiFetch<LearnerScriptListDto>('/reports/learner-script', { signal })
}
