import { and, asc, eq, or } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  courseModules,
  courses,
  courseSections,
  enrollments,
} from '../../db/schema.js'
import { ForbiddenError, NotFoundError } from '../../utils/errors.js'

export async function resolveCourseByIdOrMoodleId(rawId: number) {
  const [course] = await db
    .select()
    .from(courses)
    .where(or(eq(courses.id, rawId), eq(courses.moodleCourseId, rawId)))
    .limit(1)

  if (!course) {
    throw new NotFoundError('Course not found')
  }

  return course
}

export async function requireEnrolledCourse(userId: string, rawCourseId: number) {
  const course = await resolveCourseByIdOrMoodleId(rawCourseId)
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)))
    .limit(1)

  if (!enrollment) {
    throw new ForbiddenError('You are not enrolled in this course')
  }

  if (!course.visible && enrollment.role === 'student') {
    throw new ForbiddenError('Course is currently hidden from students')
  }

  return { course, enrollment }
}

export async function resolveCourseModuleByIdOrMoodleId(rawModuleId: number) {
  const [mod] = await db
    .select()
    .from(courseModules)
    .where(or(eq(courseModules.id, rawModuleId), eq(courseModules.moodleModuleId, rawModuleId)))
    .limit(1)

  if (!mod) {
    throw new NotFoundError('Course module not found')
  }

  return mod
}

export async function resolveAdjacentModules(courseId: number, currentModuleId: number) {
  const orderedRows = await db
    .select({
      id: courseModules.id,
      moodleModuleId: courseModules.moodleModuleId,
      moduleType: courseModules.moduleType,
      title: courseModules.title,
    })
    .from(courseModules)
    .innerJoin(courseSections, eq(courseModules.sectionId, courseSections.id))
    .where(
      and(
        eq(courseModules.courseId, courseId),
        eq(courseModules.visible, true),
        eq(courseSections.visible, true),
      ),
    )
    .orderBy(asc(courseSections.position), asc(courseModules.position), asc(courseModules.id))

  const navigable = orderedRows.filter((m) => m.moduleType !== 'label')
  const idx = navigable.findIndex((m) => m.id === currentModuleId)

  return {
    courseId,
    prev: idx > 0 ? navigable[idx - 1] : null,
    next: idx >= 0 && idx < navigable.length - 1 ? navigable[idx + 1] : null,
  }
}
