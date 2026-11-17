import { toDateKey } from './calendarGrid.ts'
import type { CalendarEventDto, CalendarScope } from '../types/calendar.ts'

export interface YmdParts {
  year: number
  month: number
  day: number
}

export function getTodayYmdInZone(timeZone: string): YmdParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const now = new Date()
  return {
    year: Number(parts.find((p) => p.type === 'year')?.value ?? now.getFullYear()),
    month: Number(parts.find((p) => p.type === 'month')?.value ?? now.getMonth() + 1),
    day: Number(parts.find((p) => p.type === 'day')?.value ?? now.getDate()),
  }
}

export function shiftCalendarDate(
  ymd: YmdParts,
  mode: 'month' | 'day' | 'upcoming',
  delta: number,
): YmdParts {
  if (mode === 'day') {
    const next = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + delta))
    return {
      year: next.getUTCFullYear(),
      month: next.getUTCMonth() + 1,
      day: next.getUTCDate(),
    }
  }
  const next = new Date(Date.UTC(ymd.year, ymd.month - 1 + delta, 1))
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: 1,
  }
}

export function buildDateTimeIsoUtc(dateKey: string, hhmm: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const [hh, mm] = hhmm.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0).toISOString()
}

export function formatMonthHeading(ymd: YmdParts): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(ymd.year, ymd.month - 1, 1)))
}

export function formatDayHeading(ymd: YmdParts): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day)))
}

export function getMonthDayKey(ymd: YmdParts): string {
  return toDateKey(ymd.year, ymd.month, ymd.day)
}

export const SCOPE_SHORT_LABELS: Record<CalendarScope, string> = {
  site: 'Site',
  category: 'Category',
  course: 'Course',
  group: 'Group',
  user: 'Personal',
  other: 'Other',
}

export function sortEventsByTime(events: CalendarEventDto[]): CalendarEventDto[] {
  return [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
}
