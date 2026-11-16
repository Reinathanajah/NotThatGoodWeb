import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  academicTerms,
  categories,
  courseAccessLogs,
  courses,
  enrollments,
} from '../../db/schema.js'
import { requireEnrolledCourse } from './courses.access.js'

export async function updateCoursePreference(
  userId: string,
  rawCourseId: number,
  patch: { isStarred?: boolean; isHidden?: boolean },
) {
  const { course, enrollment } = await requireEnrolledCourse(userId, rawCourseId)

  const [updated] = await db
    .update(enrollments)
    .set({
      isStarred: patch.isStarred ?? enrollment.isStarred,
      isHidden: patch.isHidden ?? enrollment.isHidden,
    })
    .where(eq(enrollments.id, enrollment.id))
    .returning({
      courseId: enrollments.courseId,
      isStarred: enrollments.isStarred,
      isHidden: enrollments.isHidden,
    })

  return {
    courseId: updated.courseId,
    moodleCourseId: course.moodleCourseId,
    isStarred: updated.isStarred,
    isHidden: updated.isHidden,
  }
}

export async function listRecentCourses(userId: string, limit: number) {
  return db
    .select({
      id: courses.id,
      moodleCourseId: courses.moodleCourseId,
      code: courses.code,
      title: courses.title,
      shortName: courses.shortName,
      coverStyle: courses.coverStyle,
      lastAccessedAt: courseAccessLogs.lastAccessedAt,
      termLabel: academicTerms.label,
      categoryName: categories.name,
    })
    .from(courseAccessLogs)
    .innerJoin(courses, eq(courseAccessLogs.courseId, courses.id))
    .innerJoin(
      enrollments,
      and(eq(enrollments.courseId, courses.id), eq(enrollments.userId, userId)),
    )
    .leftJoin(academicTerms, eq(courses.termId, academicTerms.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(
      and(
        eq(courseAccessLogs.userId, userId),
        eq(courses.visible, true),
        eq(enrollments.isHidden, false),
      ),
    )
    .orderBy(desc(courseAccessLogs.lastAccessedAt))
    .limit(limit)
}

export async function recordCourseAccess(userId: string, rawCourseId: number) {
  const { course } = await requireEnrolledCourse(userId, rawCourseId)
  const now = new Date()

  await db
    .insert(courseAccessLogs)
    .values({ userId, courseId: course.id, lastAccessedAt: now })
    .onConflictDoUpdate({
      target: [courseAccessLogs.userId, courseAccessLogs.courseId],
      set: { lastAccessedAt: now },
    })

  return {
    courseId: course.id,
    moodleCourseId: course.moodleCourseId,
    lastAccessedAt: now.toISOString(),
  }
}
