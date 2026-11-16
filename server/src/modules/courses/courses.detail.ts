import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  academicTerms,
  courseGroupMembers,
  courseGroups,
  enrollments,
  users,
} from '../../db/schema.js'
import { getCategoryBreadcrumbs } from '../categories/categories.service.js'
import { requireEnrolledCourse } from './courses.access.js'
import { computeCourseCompletionMap } from './courses.completion.js'
import { listCourseSectionsPayload } from './courses.sections.js'

export async function getCourseDetail(userId: string, rawCourseId: number) {
  const { course, enrollment } = await requireEnrolledCourse(userId, rawCourseId)

  const [breadcrumbs, termRow, lecturerRows, groupRows, completionMap, sections] =
    await Promise.all([
      getCategoryBreadcrumbs(course.categoryId),
      course.termId
        ? db.select().from(academicTerms).where(eq(academicTerms.id, course.termId)).limit(1)
        : Promise.resolve([null]),
      db
        .select({
          userId: users.id,
          fullName: users.fullName,
          email: users.email,
          emailVisibility: users.emailVisibility,
          role: enrollments.role,
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.userId, users.id))
        .where(
          and(
            eq(enrollments.courseId, course.id),
            inArray(enrollments.role, ['lecturer', 'ta']),
          ),
        ),
      db
        .select({ id: courseGroups.id, name: courseGroups.name })
        .from(courseGroupMembers)
        .innerJoin(courseGroups, eq(courseGroupMembers.groupId, courseGroups.id))
        .where(
          and(
            eq(courseGroupMembers.userId, userId),
            eq(courseGroups.courseId, course.id),
          ),
        ),
      computeCourseCompletionMap(userId, [course.id]),
      listCourseSectionsPayload(userId, course.id),
    ])

  return {
    id: course.id,
    moodleCourseId: course.moodleCourseId,
    code: course.code,
    title: course.title,
    shortName: course.shortName,
    format: course.format,
    summaryHtml: course.summaryHtml,
    coverStyle: course.coverStyle,
    startAt: course.startAt,
    endAt: course.endAt,
    breadcrumbs,
    term: termRow[0] ?? null,
    enrollment: {
      role: enrollment.role,
      isStarred: enrollment.isStarred,
      isHidden: enrollment.isHidden,
      groups: groupRows,
    },
    lecturers: lecturerRows.map((l) => ({
      userId: l.userId,
      fullName: l.fullName,
      role: l.role,
      email: l.emailVisibility === 'hidden' ? null : l.email,
    })),
    completion: completionMap.get(course.id) ?? {
      completedModules: 0,
      totalTrackableModules: 0,
      percentage: null,
    },
    sections,
  }
}
