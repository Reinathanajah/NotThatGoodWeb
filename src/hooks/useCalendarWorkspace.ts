import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/authContextValue.ts'
import {
  getTodayYmdInZone,
  shiftCalendarDate,
  type YmdParts,
} from '../lib/calendarHelpers.ts'
import {
  createPersonalCalendarEvent,
  deletePersonalCalendarEvent,
} from '../services/calendarEventsApi.ts'
import { fetchMyCourses } from '../services/coursesApi.ts'
import { updateMyPreferences } from '../services/navigationApi.ts'
import { fetchCalendarEvents } from '../services/widgetsApi.ts'
import type {
  CalendarEventDto,
  CalendarScope,
  CalendarViewDto,
  CreateCalendarEventInput,
} from '../types/calendar.ts'
import type { CourseSummaryDto } from '../types/courses.ts'

export type CalendarViewMode = 'month' | 'day' | 'upcoming'

export function useCalendarWorkspace() {
  const { user, refreshProfile } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const [view, setView] = useState<CalendarViewMode>('month')
  const [cursor, setCursor] = useState<YmdParts>(() => getTodayYmdInZone(tz))
  const [courseId, setCourseId] = useState<number | undefined>(undefined)
  const [courses, setCourses] = useState<CourseSummaryDto[]>([])
  const [data, setData] = useState<CalendarViewDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingScope, setTogglingScope] = useState<CalendarScope | null>(null)
  const [scopeError, setScopeError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchMyCourses({ limit: 0, sort: 'name' }, controller.signal).then(
      (res) => setCourses(res.items),
      () => undefined,
    )
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchCalendarEvents(
      {
        view,
        year: cursor.year,
        month: cursor.month,
        day: view === 'day' ? cursor.day : undefined,
        courseId,
      },
      controller.signal,
    ).then(
      (res) => {
        if (controller.signal.aborted) return
        setData(res)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load calendar events')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [view, cursor, courseId, nonce])

  const stepPeriod = useCallback(
    (delta: number) => {
      setCursor((prev) => shiftCalendarDate(prev, view, delta))
    },
    [view],
  )

  const jumpToday = useCallback(() => {
    setCursor(getTodayYmdInZone(tz))
  }, [tz])

  const toggleScope = useCallback(
    async (scope: CalendarScope) => {
      if (!data || togglingScope) return
      const current = new Set(data.hiddenScopes)
      if (current.has(scope)) current.delete(scope)
      else current.add(scope)

      setTogglingScope(scope)
      setScopeError(null)
      try {
        await updateMyPreferences({ calendarHiddenScopes: [...current] })
        await refreshProfile()
        setNonce((n) => n + 1)
      } catch (err: unknown) {
        setScopeError(err instanceof Error ? err.message : 'Unable to update filter preferences')
      } finally {
        setTogglingScope(null)
      }
    },
    [data, togglingScope, refreshProfile],
  )

  const createEvent = useCallback(async (input: CreateCalendarEventInput): Promise<CalendarEventDto> => {
    const created = await createPersonalCalendarEvent(input)
    setNonce((n) => n + 1)
    return created
  }, [])

  const deleteEvent = useCallback(async (eventId: string) => {
    await deletePersonalCalendarEvent(eventId)
    setNonce((n) => n + 1)
  }, [])

  return {
    view,
    cursor,
    courseId,
    courses,
    data,
    loading,
    error,
    togglingScope,
    scopeError,
    setView,
    setCursor,
    setCourseId,
    stepPeriod,
    jumpToday,
    toggleScope,
    createEvent,
    deleteEvent,
    retry: () => {
      setLoading(true)
      setError(null)
      setNonce((n) => n + 1)
    },
  }
}
