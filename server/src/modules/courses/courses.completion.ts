import { and, count, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  courseModules,
  courseSections,
  moduleCompletions,
} from '../../db/schema.js'
import { BadRequestError, NotFoundError } from '../../utils/errors.js'
import {
  requireEnrolledCourse,
  resolveCourseModuleByIdOrMoodleId,
} from './courses.access.js'

export async function computeCourseCompletionMap(userId: string, courseIds: number[]) {
  if (courseIds.length === 0) {
    return new Map<
      number,
      { completedModules: number; totalTrackableModules: number; percentage: number | null }
    >()
  }

  const [trackableRows, completedRows] = await Promise.all([
    db
      .select({ courseId: courseModules.courseId, total: count() })
      .from(courseModules)
      .innerJoin(courseSections, eq(courseModules.sectionId, courseSections.id))
      .where(
        and(
          inArray(courseModules.courseId, courseIds),
          eq(courseSections.visible, true),
          eq(courseModules.visible, true),
          eq(courseModules.completionTrackable, true),
        ),
      )
      .groupBy(courseModules.courseId),

    db
      .select({ courseId: courseModules.courseId, total: count() })
      .from(moduleCompletions)
      .innerJoin(courseModules, eq(moduleCompletions.moduleId, courseModules.id))
      .innerJoin(courseSections, eq(courseModules.sectionId, courseSections.id))
      .where(
        and(
          eq(moduleCompletions.userId, userId),
          inArray(courseModules.courseId, courseIds),
          eq(courseSections.visible, true),
          eq(courseModules.visible, true),
          eq(courseModules.completionTrackable, true),
        ),
      )
      .groupBy(courseModules.courseId),
  ])

  const trackableMap = new Map(trackableRows.map((r) => [r.courseId, Number(r.total)]))
  const completedMap = new Map(completedRows.map((r) => [r.courseId, Number(r.total)]))

  const result = new Map<
    number,
    { completedModules: number; totalTrackableModules: number; percentage: number | null }
  >()
  for (const id of courseIds) {
    const totalTrackableModules = trackableMap.get(id) ?? 0
    const completedModules = completedMap.get(id) ?? 0
    result.set(id, {
      completedModules,
      totalTrackableModules,
      percentage:
        totalTrackableModules > 0
          ? Math.round((completedModules / totalTrackableModules) * 100)
          : null,
    })
  }
  return result
}

export async function setModuleCompletion(
  userId: string,
  rawCourseId: number,
  rawModuleId: number,
  completed: boolean,
) {
  const { course } = await requireEnrolledCourse(userId, rawCourseId)
  const mod = await resolveCourseModuleByIdOrMoodleId(rawModuleId)

  if (mod.courseId !== course.id || !mod.visible) {
    throw new NotFoundError('Module not found in this course')
  }

  const [section] = await db
    .select({ visible: courseSections.visible })
    .from(courseSections)
    .where(eq(courseSections.id, mod.sectionId))
    .limit(1)
  if (!section || !section.visible) {
    throw new NotFoundError('Module not found in this course')
  }

  if (!mod.completionTrackable) {
    throw new BadRequestError('This module does not support completion tracking')
  }

  const now = new Date()
  if (completed) {
    await db
      .insert(moduleCompletions)
      .values({ userId, moduleId: mod.id, completedAt: now })
      .onConflictDoUpdate({
        target: [moduleCompletions.userId, moduleCompletions.moduleId],
        set: { completedAt: now },
      })
  } else {
    await db
      .delete(moduleCompletions)
      .where(
        and(
          eq(moduleCompletions.userId, userId),
          eq(moduleCompletions.moduleId, mod.id),
        ),
      )
  }

  const completionMap = await computeCourseCompletionMap(userId, [course.id])

  return {
    courseId: course.id,
    moduleId: mod.id,
    moodleModuleId: mod.moodleModuleId,
    isCompleted: completed,
    completedAt: completed ? now.toISOString() : null,
    courseCompletion: completionMap.get(course.id)!,
  }
}
