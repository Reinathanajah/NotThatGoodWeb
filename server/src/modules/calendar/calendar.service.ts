import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { resolveCourseByIdOrMoodleId } from '../courses/courses.service.js'
import {
  fetchCalendarVisibilityData,
  filterVisibleCalendarEvents,
  groupEventsByDate,
} from './calendar.queries.js'
import { resolveWindowBounds, SCOPE_LEGEND } from './calendar.timezone.js'

export { createCalendarEvent, deleteCalendarEvent } from './calendar.mutations.js'

export async function listCalendarEvents(
  userId: string,
  options: {
    view: 'month' | 'day' | 'upcoming'
    year?: number
    month?: number
    day?: number
    courseId?: number
    includeHiddenScopes: boolean
  },
) {
  const [userRow, filterCourse] = await Promise.all([
    db
      .select({
        facultyCategoryId: users.facultyCategoryId,
        programCategoryId: users.programCategoryId,
        timezone: users.timezone,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]),
    options.courseId ? resolveCourseByIdOrMoodleId(options.courseId) : Promise.resolve(null),
  ])

  const userTimezone = userRow?.timezone ?? 'UTC'
  const { startAt, endAt } = resolveWindowBounds({
    ...options,
    timezone: userTimezone,
  })

  const { prefs, enrolledRows, groupRows, rawEvents } =
    await fetchCalendarVisibilityData(userId, startAt, endAt)

  const visibleCategoryIds = new Set<number>()
  if (userRow?.facultyCategoryId) visibleCategoryIds.add(userRow.facultyCategoryId)
  if (userRow?.programCategoryId) visibleCategoryIds.add(userRow.programCategoryId)
  for (const row of enrolledRows) {
    if (row.categoryId !== null) visibleCategoryIds.add(row.categoryId)
  }

  const hiddenScopes = new Set(prefs?.calendarHiddenScopes ?? [])
  const visibleEvents = filterVisibleCalendarEvents(rawEvents, {
    userId,
    filterCourseId: filterCourse?.id ?? null,
    includeHiddenScopes: options.includeHiddenScopes,
    hiddenScopes,
    enrolledCourseIds: new Set(enrolledRows.map((r) => r.courseId)),
    visibleCategoryIds,
    groupIds: new Set(groupRows.map((g) => g.groupId)),
  })

  return {
    view: options.view,
    range: { startAt: startAt.toISOString(), endAt: endAt.toISOString() },
    timezone: userTimezone,
    hiddenScopes: [...hiddenScopes],
    scopeLegend: SCOPE_LEGEND,
    events: visibleEvents,
    byDate: groupEventsByDate(visibleEvents, userTimezone),
  }
}
