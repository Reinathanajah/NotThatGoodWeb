import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { calendarEvents, courseGroups } from '../../db/schema.js'
import { ForbiddenError, NotFoundError } from '../../utils/errors.js'
import { resolveCategoryByIdOrMoodleId } from '../categories/categories.service.js'
import { resolveCourseByIdOrMoodleId } from '../courses/courses.service.js'

export async function createCalendarEvent(
  userId: string,
  userRole: string,
  input: {
    title: string
    description?: string | null
    scope: 'site' | 'category' | 'course' | 'group' | 'user' | 'other'
    courseId?: number
    categoryId?: number
    groupId?: number
    startAt: string
    endAt?: string | null
  },
) {
  if (input.scope !== 'user' && userRole === 'student') {
    throw new ForbiddenError('Students may only create personal (user-scope) calendar events')
  }

  let resolvedCourseId: number | null = input.courseId
    ? (await resolveCourseByIdOrMoodleId(input.courseId)).id
    : null

  const resolvedCategoryId =
    input.categoryId !== undefined
      ? (await resolveCategoryByIdOrMoodleId(input.categoryId)).id
      : null

  let resolvedGroupId: number | null = null
  if (input.groupId !== undefined) {
    const [group] = await db
      .select()
      .from(courseGroups)
      .where(eq(courseGroups.id, input.groupId))
      .limit(1)
    if (!group) throw new NotFoundError('Course group not found')
    resolvedGroupId = group.id
    resolvedCourseId = resolvedCourseId ?? group.courseId
  }

  const [created] = await db
    .insert(calendarEvents)
    .values({
      title: input.title,
      description: input.description ?? null,
      scope: input.scope,
      courseId: resolvedCourseId,
      categoryId: resolvedCategoryId,
      groupId: resolvedGroupId,
      userId: input.scope === 'user' ? userId : null,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
    })
    .returning()

  return created
}

export async function deleteCalendarEvent(
  userId: string,
  userRole: string,
  eventId: string,
) {
  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, eventId))
    .limit(1)

  if (!event) {
    throw new NotFoundError('Calendar event not found')
  }

  if (event.scope === 'user') {
    if (event.userId !== userId) {
      throw new ForbiddenError('You can only delete your own calendar events')
    }
  } else if (userRole === 'student') {
    throw new ForbiddenError('Students cannot delete non-personal calendar events')
  }

  await db.delete(calendarEvents).where(eq(calendarEvents.id, event.id))
  return { deletedId: event.id }
}
