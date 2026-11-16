export type CalendarScope = 'site' | 'category' | 'course' | 'group' | 'user' | 'other'

export interface CalendarEventDto {
  id: string
  title: string
  description: string | null
  scope: CalendarScope
  courseId: number | null
  categoryId: number | null
  groupId: number | null
  moduleId: number | null
  startAt: string
  endAt: string | null
  isOwnedByUser: boolean
}

export interface CalendarViewDto {
  view: 'month' | 'day' | 'upcoming'
  range: { startAt: string; endAt: string }
  timezone: string
  hiddenScopes: CalendarScope[]
  scopeLegend: Array<{ scope: CalendarScope; label: string }>
  events: CalendarEventDto[]
  byDate: Record<string, CalendarEventDto[]>
}

export interface CreateCalendarEventInput {
  title: string
  description?: string | null
  scope?: CalendarScope
  courseId?: number
  categoryId?: number
  groupId?: number
  startAt: string
  endAt?: string | null
}
