import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courses, enrollments } from '../../db/schema.js'

export interface CategoryCourseQueryRow {
  id: number
  moodleCourseId: number | null
  code: string
  title: string
  shortName: string
  format: string
  coverStyle: typeof courses.$inferSelect.coverStyle | null
  startAt: Date | null
  endAt: Date | null
  categoryId: number | null
  categoryName: string | null
  categorySlug: string | null
  termId: number | null
  termCode: string | null
  termLabel: string | null
}

export async function getUserEnrolledCourseIds(
  userId: string | undefined,
  courseIds: number[],
): Promise<Set<number>> {
  if (!userId || courseIds.length === 0) return new Set()
  const rows = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), inArray(enrollments.courseId, courseIds)))
  return new Set(rows.map((r) => r.courseId))
}

export function mapCategoryCourseRow(
  row: CategoryCourseQueryRow,
  enrolledSet: Set<number>,
) {
  return {
    id: row.id,
    moodleCourseId: row.moodleCourseId,
    code: row.code,
    title: row.title,
    shortName: row.shortName,
    format: row.format,
    coverStyle: row.coverStyle,
    startAt: row.startAt,
    endAt: row.endAt,
    isEnrolled: enrolledSet.has(row.id),
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName, slug: row.categorySlug }
      : null,
    term: row.termId
      ? { id: row.termId, code: row.termCode, label: row.termLabel }
      : null,
  }
}
