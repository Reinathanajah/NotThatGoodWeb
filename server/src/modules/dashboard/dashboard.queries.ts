import { and, eq, inArray } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { db } from '../../db/index.js'
import {
  assignments,
  assignmentSubmissions,
  courseModules,
  courseSections,
  courses,
  enrollments,
  quizAttempts,
  quizzes,
} from '../../db/schema.js'
import type { RawTimelineRow } from './dashboard.types.js'

function queryActivityDeadlines(
  userId: string,
  table: typeof assignments | typeof quizzes,
  opensAtCol: AnyPgColumn,
  dueAtCol: AnyPgColumn,
): Promise<RawTimelineRow[]> {
  return db
    .select({
      moduleId: courseModules.id,
      moodleModuleId: courseModules.moodleModuleId,
      title: courseModules.title,
      opensAt: opensAtCol,
      dueAt: dueAtCol,
      courseId: courses.id,
      moodleCourseId: courses.moodleCourseId,
      courseCode: courses.code,
      courseTitle: courses.title,
      courseShortName: courses.shortName,
    })
    .from(table)
    .innerJoin(courseModules, eq(table.moduleId, courseModules.id))
    .innerJoin(courseSections, eq(courseModules.sectionId, courseSections.id))
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .innerJoin(
      enrollments,
      and(eq(enrollments.courseId, courses.id), eq(enrollments.userId, userId)),
    )
    .where(
      and(
        eq(courses.visible, true),
        eq(courseSections.visible, true),
        eq(courseModules.visible, true),
        eq(enrollments.isHidden, false),
      ),
    ) as Promise<RawTimelineRow[]>
}

export async function fetchVisibleCourseActivities(userId: string) {
  const [assignRows, quizRows] = await Promise.all([
    queryActivityDeadlines(userId, assignments, assignments.opensAt, assignments.dueAt),
    queryActivityDeadlines(userId, quizzes, quizzes.opensAt, quizzes.closedAt),
  ])
  return { assignRows, quizRows }
}

export async function fetchSubmittedActivityIds(
  userId: string,
  assignModuleIds: number[],
  quizModuleIds: number[],
) {
  const [submittedAssignRows, submittedQuizRows] = await Promise.all([
    assignModuleIds.length > 0
      ? db
          .select({ moduleId: assignmentSubmissions.assignmentModuleId })
          .from(assignmentSubmissions)
          .where(
            and(
              eq(assignmentSubmissions.userId, userId),
              inArray(assignmentSubmissions.assignmentModuleId, assignModuleIds),
              eq(assignmentSubmissions.status, 'submitted'),
            ),
          )
      : Promise.resolve([]),
    quizModuleIds.length > 0
      ? db
          .select({ moduleId: quizAttempts.quizModuleId })
          .from(quizAttempts)
          .where(
            and(
              eq(quizAttempts.userId, userId),
              inArray(quizAttempts.quizModuleId, quizModuleIds),
              eq(quizAttempts.status, 'submitted'),
            ),
          )
      : Promise.resolve([]),
  ])

  return {
    submittedAssignIds: new Set(submittedAssignRows.map((r) => r.moduleId)),
    submittedQuizIds: new Set(submittedQuizRows.map((r) => r.moduleId)),
  }
}
