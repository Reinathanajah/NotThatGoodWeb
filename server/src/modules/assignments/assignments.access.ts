import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { assignments, assignmentSubmissions, courseSections } from '../../db/schema.js'
import { NotFoundError } from '../../utils/errors.js'
import {
  requireEnrolledCourse,
  resolveCourseModuleByIdOrMoodleId,
} from '../courses/courses.service.js'

export async function loadAuthorizedAssignment(userId: string, rawModuleId: number) {
  const mod = await resolveCourseModuleByIdOrMoodleId(rawModuleId)
  if (!mod.visible || mod.moduleType !== 'assign') {
    throw new NotFoundError('Assignment module not found')
  }

  const { course, enrollment } = await requireEnrolledCourse(userId, mod.courseId)

  const [[assignRow], [sectionRow]] = await Promise.all([
    db.select().from(assignments).where(eq(assignments.moduleId, mod.id)).limit(1),
    db
      .select({
        id: courseSections.id,
        title: courseSections.title,
        position: courseSections.position,
        visible: courseSections.visible,
      })
      .from(courseSections)
      .where(eq(courseSections.id, mod.sectionId))
      .limit(1),
  ])

  if (!assignRow || (!sectionRow?.visible && enrollment.role === 'student')) {
    throw new NotFoundError('Assignment configuration not found')
  }

  return { mod, course, assignRow, sectionRow }
}

export async function getLatestSubmission(assignmentModuleId: number, userId: string) {
  const [submission] = await db
    .select()
    .from(assignmentSubmissions)
    .where(
      and(
        eq(assignmentSubmissions.assignmentModuleId, assignmentModuleId),
        eq(assignmentSubmissions.userId, userId),
      ),
    )
    .orderBy(desc(assignmentSubmissions.attemptNumber))
    .limit(1)

  return submission ?? null
}
