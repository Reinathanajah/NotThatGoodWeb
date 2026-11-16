import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  enrollments,
  gradeItems,
  grades,
  moduleCompletions,
  quizAttempts,
} from '../../db/schema.js'
import { BadRequestError } from '../../utils/errors.js'
import { computeWeightedCourseGrade } from '../grades/grades.service.js'
import { loadOwnedInProgressAttempt } from './quizzes.access.js'
import { scoreAttempt, validateAndMergeAnswers } from './quizzes.scoring.js'

const SUBMIT_GRACE_MS = 60_000

/** Finalize an active attempt atomically, then sync module completion and gradebook cache. */
export async function submitQuizAttempt(
  userId: string,
  attemptId: string,
  incomingAnswers?: Record<string, number>,
) {
  const { attempt, quizRow, mod, deadline } = await loadOwnedInProgressAttempt(
    userId,
    attemptId,
  )
  const now = new Date()

  if (now.getTime() > deadline.getTime() + SUBMIT_GRACE_MS) {
    await db
      .update(quizAttempts)
      .set({ status: 'expired' })
      .where(and(eq(quizAttempts.id, attempt.id), eq(quizAttempts.status, 'in_progress')))
    throw new BadRequestError('Quiz attempt time limit has expired')
  }

  const finalAnswers = incomingAnswers
    ? validateAndMergeAnswers(quizRow.questionsJson, attempt.answersJson, incomingAnswers)
    : attempt.answersJson

  const graded = scoreAttempt(quizRow.questionsJson, finalAnswers, quizRow.maxGrade)

  await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(quizAttempts)
      .set({
        status: 'submitted',
        answersJson: finalAnswers,
        score: graded.scaledScore,
        submittedAt: now,
      })
      .where(and(eq(quizAttempts.id, attempt.id), eq(quizAttempts.status, 'in_progress')))
      .returning({ id: quizAttempts.id })

    if (!claimed) {
      throw new BadRequestError('Quiz attempt is already submitted or expired')
    }

    if (mod.completionTrackable) {
      await tx
        .insert(moduleCompletions)
        .values({ userId, moduleId: mod.id, completedAt: now })
        .onConflictDoUpdate({
          target: [moduleCompletions.userId, moduleCompletions.moduleId],
          set: { completedAt: now },
        })
    }

    const [existingItem] = await tx
      .select()
      .from(gradeItems)
      .where(and(eq(gradeItems.courseId, mod.courseId), eq(gradeItems.moduleId, mod.id)))
      .limit(1)

    const gradeItemId = existingItem
      ? existingItem.id
      : (
          await tx
            .insert(gradeItems)
            .values({
              courseId: mod.courseId,
              moduleId: mod.id,
              name: mod.title,
              maxGrade: quizRow.maxGrade,
            })
            .returning({ id: gradeItems.id })
        )[0].id

    await tx
      .insert(grades)
      .values({
        gradeItemId,
        userId,
        score: graded.scaledScore,
        gradedAt: now,
      })
      .onConflictDoUpdate({
        target: [grades.gradeItemId, grades.userId],
        set: { score: graded.scaledScore, gradedAt: now },
      })

    const courseGrades = await tx
      .select({ score: grades.score, weight: gradeItems.weight })
      .from(gradeItems)
      .innerJoin(
        grades,
        and(eq(grades.gradeItemId, gradeItems.id), eq(grades.userId, userId)),
      )
      .where(
        and(
          eq(gradeItems.courseId, mod.courseId),
          eq(gradeItems.isHiddenFromStudents, false),
        ),
      )

    const avg = computeWeightedCourseGrade(courseGrades)
    if (avg !== null) {
      await tx
        .update(enrollments)
        .set({ cachedFinalGrade: avg })
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, mod.courseId)))
    }
  })

  return {
    attemptId: attempt.id,
    quizModuleId: mod.id,
    attemptNumber: attempt.attemptNumber,
    status: 'submitted',
    submittedAt: now.toISOString(),
    score: graded.scaledScore,
    maxGrade: quizRow.maxGrade,
    earnedPoints: graded.earnedPoints,
    totalPoints: graded.totalPoints,
    review: graded.breakdown,
  }
}
