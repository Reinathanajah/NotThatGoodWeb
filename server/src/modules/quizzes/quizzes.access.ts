import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courseModules, courseSections, quizAttempts, quizzes } from '../../db/schema.js'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors.js'
import {
  requireEnrolledCourse,
  resolveCourseModuleByIdOrMoodleId,
} from '../courses/courses.service.js'
import { computeAttemptDeadline } from './quizzes.scoring.js'

export async function loadAuthorizedQuiz(userId: string, rawModuleId: number) {
  const mod = await resolveCourseModuleByIdOrMoodleId(rawModuleId)
  if (!mod.visible || mod.moduleType !== 'quiz') {
    throw new NotFoundError('Quiz module not found')
  }

  const { course, enrollment } = await requireEnrolledCourse(userId, mod.courseId)

  const [[quizRow], [sectionRow]] = await Promise.all([
    db.select().from(quizzes).where(eq(quizzes.moduleId, mod.id)).limit(1),
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

  if (!quizRow || (!sectionRow?.visible && enrollment.role === 'student')) {
    throw new NotFoundError('Quiz configuration not found')
  }

  return { mod, course, quizRow, sectionRow }
}

export async function loadOwnedInProgressAttempt(userId: string, attemptId: string) {
  const [attempt] = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.id, attemptId))
    .limit(1)

  if (!attempt) {
    throw new NotFoundError('Quiz attempt not found')
  }
  if (attempt.userId !== userId) {
    throw new ForbiddenError('You do not own this quiz attempt')
  }
  if (attempt.status !== 'in_progress') {
    throw new BadRequestError(`Quiz attempt is already ${attempt.status}`)
  }

  const [[quizRow], [mod]] = await Promise.all([
    db.select().from(quizzes).where(eq(quizzes.moduleId, attempt.quizModuleId)).limit(1),
    db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, attempt.quizModuleId))
      .limit(1),
  ])

  if (!quizRow || !mod) {
    throw new NotFoundError('Quiz configuration not found')
  }

  const deadline = computeAttemptDeadline(
    quizRow.closedAt,
    attempt.startedAt,
    quizRow.timeLimitSeconds,
  )

  return { attempt, quizRow, mod, deadline }
}
