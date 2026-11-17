import type { SummaryMetric } from '../components/reports/GradebookSummaryStrip.tsx'
import type { LearnerScriptDetailDto } from '../types/reports.ts'

export interface CourseProgressRow {
  courseId: number
  moodleCourseId: number | null
  courseCode: string
  courseTitle: string
  completedModules: number
  totalTrackableModules: number
  completionRatePercent: number | null
  submissionsCount: number
  quizAttemptsCount: number
  quizAverageScore: number | null
  finalGrade: string | null
  lastAccessedAt: string | null
}

export interface QuizTagRow {
  tag: string
  quizzesCount: number
  questionsCount: number
  attemptedQuestionsCount: number
  correctCount: number
  accuracyPercent: number | null
  avgDurationSeconds: number | null
}

function asNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asInt(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStr(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function parseCourseProgressRows(rows: Array<Record<string, unknown>>): CourseProgressRow[] {
  return rows.map((r) => ({
    courseId: asInt(r.courseId),
    moodleCourseId: asNum(r.moodleCourseId),
    courseCode: asStr(r.courseCode, 'COURSE'),
    courseTitle: asStr(r.courseTitle, 'Untitled course'),
    completedModules: asInt(r.completedModules),
    totalTrackableModules: asInt(r.totalTrackableModules),
    completionRatePercent: asNum(r.completionRatePercent),
    submissionsCount: asInt(r.submissionsCount),
    quizAttemptsCount: asInt(r.quizAttemptsCount),
    quizAverageScore: asNum(r.quizAverageScore),
    finalGrade: typeof r.finalGrade === 'string' ? r.finalGrade : null,
    lastAccessedAt: typeof r.lastAccessedAt === 'string' ? r.lastAccessedAt : null,
  }))
}

export function parseQuizTagRows(rows: Array<Record<string, unknown>>): QuizTagRow[] {
  return rows.map((r) => ({
    tag: asStr(r.tag, 'Untagged'),
    quizzesCount: asInt(r.quizzesCount),
    questionsCount: asInt(r.questionsCount),
    attemptedQuestionsCount: asInt(r.attemptedQuestionsCount),
    correctCount: asInt(r.correctCount),
    accuracyPercent: asNum(r.accuracyPercent),
    avgDurationSeconds: asNum(r.avgDurationSeconds),
  }))
}

export function buildAnalyticsSummaryMetrics(detail: LearnerScriptDetailDto): SummaryMetric[] {
  const s = detail.summary
  if (detail.report.reportType === 'quiz_tags') {
    return [
      { label: 'Topic tags', value: String(s.totalTags ?? 0) },
      { label: 'Tagged questions', value: String(s.totalQuestions ?? 0) },
      { label: 'Questions attempted', value: String(s.totalAttempted ?? 0) },
    ]
  }
  const avgComp =
    typeof s.averageCompletionPercent === 'number' ? `${s.averageCompletionPercent.toFixed(1)}%` : '-'
  const avgQuiz =
    typeof s.overallQuizAverage === 'number' ? `${s.overallQuizAverage.toFixed(1)}%` : '-'
  return [
    { label: 'Courses tracked', value: String(s.totalCourses ?? 0) },
    { label: 'Avg completion', value: avgComp },
    {
      label: 'Overall quiz average',
      value: `${avgQuiz} (${String(s.totalSubmissions ?? 0)} submissions)`,
    },
  ]
}
