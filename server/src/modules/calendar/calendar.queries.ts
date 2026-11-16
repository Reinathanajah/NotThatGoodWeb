import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  calendarEvents,
  courseGroupMembers,
  courses,
  enrollments,
  userPreferences,
} from '../../db/schema.js'
import { formatDayKeyInZone } from './calendar.timezone.js'

export interface CalendarEventRow {
  id: string
  title: string
  description: string | null
  scope: 'site' | 'category' | 'course' | 'group' | 'user' | 'other'
  courseId: number | null
  categoryId: number | null
  groupId: number | null
  userId: string | null
  moduleId: number | null
  startAt: Date
  endAt: Date | null
  courseTitle: string | null
  courseCode: string | null
}

export async function fetchCalendarVisibilityData(
  userId: string,
  startAt: Date,
  endAt: Date,
) {
  const [prefs, enrolledRows, groupRows, rawEvents] = await Promise.all([
    db
      .select({ calendarHiddenScopes: userPreferences.calendarHiddenScopes })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1)
      .then((rows) => rows[0]),
    db
      .select({ courseId: enrollments.courseId, categoryId: courses.categoryId })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(enrollments.userId, userId), eq(courses.visible, true))),
    db
      .select({ groupId: courseGroupMembers.groupId })
      .from(courseGroupMembers)
      .where(eq(courseGroupMembers.userId, userId)),
    db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        scope: calendarEvents.scope,
        courseId: calendarEvents.courseId,
        categoryId: calendarEvents.categoryId,
        groupId: calendarEvents.groupId,
        userId: calendarEvents.userId,
        moduleId: calendarEvents.moduleId,
        startAt: calendarEvents.startAt,
        endAt: calendarEvents.endAt,
        courseTitle: courses.title,
        courseCode: courses.code,
      })
      .from(calendarEvents)
      .leftJoin(courses, eq(calendarEvents.courseId, courses.id))
      .where(and(gte(calendarEvents.startAt, startAt), lt(calendarEvents.startAt, endAt)))
      .orderBy(asc(calendarEvents.startAt), asc(calendarEvents.title)),
  ])

  return { prefs, enrolledRows, groupRows, rawEvents }
}

export function filterVisibleCalendarEvents(
  rawEvents: CalendarEventRow[],
  ctx: {
    userId: string
    filterCourseId: number | null
    includeHiddenScopes: boolean
    hiddenScopes: Set<string>
    enrolledCourseIds: Set<number>
    visibleCategoryIds: Set<number>
    groupIds: Set<number>
  },
) {
  return rawEvents.filter((event) => {
    if (!ctx.includeHiddenScopes && ctx.hiddenScopes.has(event.scope)) return false
    if (ctx.filterCourseId && event.courseId !== ctx.filterCourseId) return false

    if (event.scope === 'site' || event.scope === 'other') return true
    if (event.scope === 'user') return event.userId === ctx.userId
    if (event.scope === 'course') {
      return event.courseId !== null && ctx.enrolledCourseIds.has(event.courseId)
    }
    if (event.scope === 'group') {
      return event.groupId !== null && ctx.groupIds.has(event.groupId)
    }
    if (event.scope === 'category') {
      return event.categoryId !== null && ctx.visibleCategoryIds.has(event.categoryId)
    }
    return false
  })
}

export function groupEventsByDate(events: CalendarEventRow[], timezone: string) {
  const byDate: Record<string, CalendarEventRow[]> = {}
  for (const event of events) {
    const dayKey = formatDayKeyInZone(event.startAt, timezone)
    byDate[dayKey] = byDate[dayKey] ?? []
    byDate[dayKey].push(event)
  }
  return byDate
}
