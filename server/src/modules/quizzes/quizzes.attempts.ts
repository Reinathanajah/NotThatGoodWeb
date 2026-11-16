import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { quizAttempts } from '../../db/schema.js'
import { BadRequestError } from '../../utils/errors.js'
import { loadAuthorizedQuiz, loadOwnedInProgressAttempt } from './quizzes.access.js'
import {
  computeAttemptDeadline,
  sanitizeQuestions,
  validateAndMergeAnswers,
} from './quizzes.scoring.js'

/** Start or resume an attempt under an advisory transaction lock to prevent maxAttempts races. */
export async function startOrResumeQuizAttempt(userId: string, rawModuleId: number) {
  const { mod, quizRow } = await loadAuthorizedQuiz(userId, rawModuleId)
  const now = new Date()

  if (now.getTime() < quizRow.opensAt.getTime()) {
    throw new BadRequestError('Quiz has not opened yet')
  }
  if (now.getTime() > quizRow.closedAt.getTime()) {
    throw new BadRequestError('Quiz is already closed')
  }

  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}), ${mod.id})`)

    const existingAttempts = await tx
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizModuleId, mod.id), eq(quizAttempts.userId, userId)))
      .orderBy(desc(quizAttempts.attemptNumber))

    const inProgress = existingAttempts.find((a) => a.status === 'in_progress')
    if (inProgress) {
      const deadline = computeAttemptDeadline(
        quizRow.closedAt,
        inProgress.startedAt,
        quizRow.timeLimitSeconds,
      )
      if (now.getTime() <= deadline.getTime()) {
        return {
          attemptId: inProgress.id,
          quizModuleId: mod.id,
          attemptNumber: inProgress.attemptNumber,
          status: inProgress.status,
          startedAt: inProgress.startedAt,
          deadlineAt: deadline,
          answers: inProgress.answersJson,
          questions: sanitizeQuestions(quizRow.questionsJson),
        }
      }

      await tx
        .update(quizAttempts)
        .set({ status: 'expired' })
        .where(eq(quizAttempts.id, inProgress.id))
    }

    if (existingAttempts.length >= quizRow.maxAttempts) {
      throw new BadRequestError(
        `Maximum number of attempts (${quizRow.maxAttempts}) reached`,
      )
    }

    const nextNumber = (existingAttempts[0]?.attemptNumber ?? 0) + 1
    const [created] = await tx
      .insert(quizAttempts)
      .values({
        quizModuleId: mod.id,
        userId,
        attemptNumber: nextNumber,
        status: 'in_progress',
        answersJson: {},
        startedAt: now,
      })
      .returning()

    return {
      attemptId: created.id,
      quizModuleId: mod.id,
      attemptNumber: created.attemptNumber,
      status: created.status,
      startedAt: created.startedAt,
      deadlineAt: computeAttemptDeadline(
        quizRow.closedAt,
        created.startedAt,
        quizRow.timeLimitSeconds,
      ),
      answers: created.answersJson,
      questions: sanitizeQuestions(quizRow.questionsJson),
    }
  })
}

export async function saveAttemptAnswers(
  userId: string,
  attemptId: string,
  incomingAnswers: Record<string, number>,
) {
  const { attempt, quizRow, deadline } = await loadOwnedInProgressAttempt(userId, attemptId)
  const now = new Date()

  if (now.getTime() > deadline.getTime()) {
    await db
      .update(quizAttempts)
      .set({ status: 'expired' })
      .where(and(eq(quizAttempts.id, attempt.id), eq(quizAttempts.status, 'in_progress')))
    throw new BadRequestError('Quiz attempt time limit has expired')
  }

  const mergedAnswers = validateAndMergeAnswers(
    quizRow.questionsJson,
    attempt.answersJson,
    incomingAnswers,
  )

  const [updated] = await db
    .update(quizAttempts)
    .set({ answersJson: mergedAnswers })
    .where(and(eq(quizAttempts.id, attempt.id), eq(quizAttempts.status, 'in_progress')))
    .returning()

  if (!updated) {
    throw new BadRequestError('Quiz attempt is no longer active')
  }

  return {
    attemptId: updated.id,
    status: updated.status,
    answers: updated.answersJson,
    deadlineAt: deadline,
  }
}
