import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignmentSubmissions,
  courseModules,
  quizAttempts,
} from '../../db/schema.js'
import { computeCourseCompletionMap } from '../courses/courses.service.js'
import {
  getEnrolledReportCourses,
  type ReportColumn,
  type ReportPayload,
} from './reports.queries.js'

const PROGRESS_COLUMNS: ReportColumn[] = [
  { key: 'courseCode', label: 'Course Code' },
  { key: 'courseTitle', label: 'Course' },
  { key: 'completionRatePercent', label: 'Completion (%)' },
  { key: 'submissionsCount', label: 'Submissions' },
  { key: 'quizAverageScore', label: 'Quiz Average' },
  { key: 'finalGrade', label: 'Grade' },
]

export async function buildCourseProgressReport(
  userId: string,
  filterCourseId?: number,
): Promise<ReportPayload> {
  const enrolled = await getEnrolledReportCourses(userId, filterCourseId)
  const courseIds = enrolled.map((c) => c.courseId)

  if (courseIds.length === 0) {
    return {
      columns: PROGRESS_COLUMNS,
      rows: [],
      summary: {
        totalCourses: 0,
        averageCompletionPercent: 0,
        totalSubmissions: 0,
        overallQuizAverage: null,
      },
    }
  }

  const [completionMap, submissionRows, attemptRows] = await Promise.all([
    computeCourseCompletionMap(userId, courseIds),
    db
      .select({ courseId: courseModules.courseId })
      .from(assignmentSubmissions)
      .innerJoin(
        courseModules,
        eq(assignmentSubmissions.assignmentModuleId, courseModules.id),
      )
      .where(
        and(
          eq(assignmentSubmissions.userId, userId),
          eq(assignmentSubmissions.status, 'submitted'),
          inArray(courseModules.courseId, courseIds),
        ),
      ),
    db
      .select({ courseId: courseModules.courseId, score: quizAttempts.score })
      .from(quizAttempts)
      .innerJoin(courseModules, eq(quizAttempts.quizModuleId, courseModules.id))
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.status, 'submitted'),
          inArray(courseModules.courseId, courseIds),
        ),
      ),
  ])

  const submissionsByCourse = new Map<number, number>()
  for (const sub of submissionRows) {
    submissionsByCourse.set(
      sub.courseId,
      (submissionsByCourse.get(sub.courseId) ?? 0) + 1,
    )
  }

  const quizScoresByCourse = new Map<number, number[]>()
  for (const att of attemptRows) {
    if (att.score === null) continue
    const list = quizScoresByCourse.get(att.courseId) ?? []
    list.push(Number(att.score))
    quizScoresByCourse.set(att.courseId, list)
  }

  const rows = enrolled.map((course) => {
    const completion = completionMap.get(course.courseId) ?? {
      completedModules: 0,
      totalTrackableModules: 0,
      percentage: null,
    }
    const quizScores = quizScoresByCourse.get(course.courseId) ?? []
    const quizAverageScore =
      quizScores.length > 0
        ? Math.round(
            (quizScores.reduce((acc, s) => acc + s, 0) / quizScores.length) * 100,
          ) / 100
        : null

    return {
      courseId: course.courseId,
      moodleCourseId: course.moodleCourseId,
      courseCode: course.code,
      courseTitle: course.title,
      completedModules: completion.completedModules,
      totalTrackableModules: completion.totalTrackableModules,
      completionRatePercent: completion.percentage ?? 0,
      submissionsCount: submissionsByCourse.get(course.courseId) ?? 0,
      quizAttemptsCount: quizScores.length,
      quizAverageScore,
      finalGrade:
        course.cachedFinalGrade !== null ? Number(course.cachedFinalGrade) : null,
      lastAccessedAt: course.lastAccessedAt ? course.lastAccessedAt.toISOString() : null,
    }
  })

  const trackableRows = rows.filter((r) => r.totalTrackableModules > 0)
  const averageCompletionPercent =
    trackableRows.length > 0
      ? Math.round(
          trackableRows.reduce((sum, r) => sum + r.completionRatePercent, 0) /
            trackableRows.length,
        )
      : 0
  const allQuizScores = rows
    .map((r) => r.quizAverageScore)
    .filter((v): v is number => v !== null)
  const overallQuizAverage =
    allQuizScores.length > 0
      ? Math.round(
          (allQuizScores.reduce((sum, v) => sum + v, 0) / allQuizScores.length) * 100,
        ) / 100
      : null

  return {
    columns: PROGRESS_COLUMNS,
    rows,
    summary: {
      totalCourses: rows.length,
      averageCompletionPercent,
      totalSubmissions: submissionRows.length,
      overallQuizAverage,
    },
  }
}
