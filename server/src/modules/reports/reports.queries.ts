import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courseAccessLogs, courses, enrollments } from '../../db/schema.js'

export interface ReportColumn {
  key: string
  label: string
}

export interface ReportPayload {
  columns: ReportColumn[]
  rows: Array<Record<string, unknown>>
  summary: Record<string, unknown>
}

export type ReportBuilder = (
  userId: string,
  filterCourseId?: number,
) => Promise<ReportPayload>

export async function getEnrolledReportCourses(userId: string, filterCourseId?: number) {
  const baseWhere = filterCourseId
    ? and(
        eq(enrollments.userId, userId),
        eq(courses.visible, true),
        eq(courses.id, filterCourseId),
      )
    : and(eq(enrollments.userId, userId), eq(courses.visible, true))

  return db
    .select({
      courseId: courses.id,
      moodleCourseId: courses.moodleCourseId,
      code: courses.code,
      title: courses.title,
      cachedFinalGrade: enrollments.cachedFinalGrade,
      lastAccessedAt: courseAccessLogs.lastAccessedAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(
      courseAccessLogs,
      and(
        eq(courseAccessLogs.courseId, courses.id),
        eq(courseAccessLogs.userId, enrollments.userId),
      ),
    )
    .where(baseWhere)
    .orderBy(asc(courses.title))
}
