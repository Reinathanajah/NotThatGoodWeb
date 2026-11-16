import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courseModules, quizAttempts, quizzes } from '../../db/schema.js'
import { getEnrolledReportCourses, type ReportPayload } from './reports.queries.js'
import { accumulateQuizTags, QUIZ_TAG_COLUMNS } from './reports.quizTagAccum.js'

export async function buildQuizTagsReport(
  userId: string,
  filterCourseId?: number,
): Promise<ReportPayload> {
  const enrolled = await getEnrolledReportCourses(userId, filterCourseId)
  const courseIds = enrolled.map((c) => c.courseId)

  if (courseIds.length === 0) {
    return {
      columns: QUIZ_TAG_COLUMNS,
      rows: [],
      summary: { totalTags: 0, totalQuestions: 0, totalAttempted: 0 },
    }
  }

  const quizRows = await db
    .select({ moduleId: quizzes.moduleId, questionsJson: quizzes.questionsJson })
    .from(quizzes)
    .innerJoin(courseModules, eq(quizzes.moduleId, courseModules.id))
    .where(and(inArray(courseModules.courseId, courseIds), eq(courseModules.visible, true)))

  const quizIds = quizRows.map((q) => q.moduleId)
  const attemptRows =
    quizIds.length > 0
      ? await db
          .select({
            quizModuleId: quizAttempts.quizModuleId,
            answersJson: quizAttempts.answersJson,
            startedAt: quizAttempts.startedAt,
            submittedAt: quizAttempts.submittedAt,
          })
          .from(quizAttempts)
          .where(
            and(
              eq(quizAttempts.userId, userId),
              eq(quizAttempts.status, 'submitted'),
              inArray(quizAttempts.quizModuleId, quizIds),
            ),
          )
          .orderBy(desc(quizAttempts.submittedAt))
      : []

  const attemptsByQuiz = new Map<number, typeof attemptRows>()
  for (const att of attemptRows) {
    const list = attemptsByQuiz.get(att.quizModuleId) ?? []
    list.push(att)
    attemptsByQuiz.set(att.quizModuleId, list)
  }

  const tagMap = accumulateQuizTags(quizRows, attemptsByQuiz)
  const rows = [...tagMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, stats]) => ({
      tag,
      quizzesCount: stats.quizIds.size,
      questionsCount: stats.questionsCount,
      attemptedQuestionsCount: stats.attemptedQuestionsCount,
      correctCount: stats.correctCount,
      accuracyPercent:
        stats.attemptedQuestionsCount > 0
          ? Math.round((stats.correctCount / stats.attemptedQuestionsCount) * 10000) / 100
          : null,
      avgDurationSeconds:
        stats.durationsSeconds.length > 0
          ? Math.round(
              stats.durationsSeconds.reduce((s, d) => s + d, 0) / stats.durationsSeconds.length,
            )
          : null,
    }))

  return {
    columns: QUIZ_TAG_COLUMNS,
    rows,
    summary: {
      totalTags: rows.length,
      totalQuestions: rows.reduce((sum, r) => sum + r.questionsCount, 0),
      totalAttempted: rows.reduce((sum, r) => sum + r.attemptedQuestionsCount, 0),
    },
  }
}
