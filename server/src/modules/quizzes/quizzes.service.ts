import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { quizAttempts } from '../../db/schema.js'
import { getCategoryBreadcrumbs } from '../categories/categories.service.js'
import { resolveAdjacentModules } from '../courses/courses.service.js'
import { loadAuthorizedQuiz } from './quizzes.access.js'
import { computeAttemptDeadline, resolveWindowStatus } from './quizzes.scoring.js'

export {
  saveAttemptAnswers,
  startOrResumeQuizAttempt,
} from './quizzes.attempts.js'
export { submitQuizAttempt } from './quizzes.submit.js'

export async function getQuizDetail(userId: string, rawModuleId: number) {
  const { mod, course, quizRow, sectionRow } = await loadAuthorizedQuiz(
    userId,
    rawModuleId,
  )

  const [breadcrumbs, attemptRows, navigation] = await Promise.all([
    getCategoryBreadcrumbs(course.categoryId),
    db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizModuleId, mod.id), eq(quizAttempts.userId, userId)))
      .orderBy(asc(quizAttempts.attemptNumber)),
    resolveAdjacentModules(course.id, mod.id),
  ])

  const windowStatus = resolveWindowStatus(quizRow.opensAt, quizRow.closedAt, Date.now())
  const activeAttempt = attemptRows.find((a) => a.status === 'in_progress') ?? null

  return {
    moduleId: mod.id,
    moodleModuleId: mod.moodleModuleId,
    title: mod.title,
    subsectionLabel: mod.subsectionLabel,
    descriptionHtml: mod.descriptionHtml,
    opensAt: quizRow.opensAt,
    closedAt: quizRow.closedAt,
    timeLimitSeconds: quizRow.timeLimitSeconds,
    maxAttempts: quizRow.maxAttempts,
    maxGrade: quizRow.maxGrade,
    questionCount: quizRow.questionsJson.length,
    windowStatus,
    canStartAttempt:
      windowStatus === 'open' &&
      (Boolean(activeAttempt) || attemptRows.length < quizRow.maxAttempts),
    course: {
      id: course.id,
      moodleCourseId: course.moodleCourseId,
      code: course.code,
      title: course.title,
    },
    section: sectionRow
      ? { id: sectionRow.id, title: sectionRow.title, position: sectionRow.position }
      : null,
    breadcrumbs,
    attempts: attemptRows.map((a) => ({
      id: a.id,
      attemptNumber: a.attemptNumber,
      status: a.status,
      score: a.score,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      deadlineAt: computeAttemptDeadline(
        quizRow.closedAt,
        a.startedAt,
        quizRow.timeLimitSeconds,
      ),
    })),
    navigation,
  }
}
