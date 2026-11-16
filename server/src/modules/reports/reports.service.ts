import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { learnerScriptReports } from '../../db/schema.js'
import { NotFoundError } from '../../utils/errors.js'
import { requireEnrolledCourse } from '../courses/courses.service.js'
import { buildCourseProgressReport } from './reports.progress.js'
import type { ReportBuilder } from './reports.queries.js'
import { buildQuizTagsReport } from './reports.quizTags.js'

const REPORT_BUILDERS: Record<string, ReportBuilder> = {
  course_progress: buildCourseProgressReport,
  quiz_tags: buildQuizTagsReport,
}

export async function listLearnerScriptReports(userId: string, userRole: string) {
  const [reports, progressSnapshot] = await Promise.all([
    db
      .select({
        key: learnerScriptReports.key,
        title: learnerScriptReports.title,
        description: learnerScriptReports.description,
        reportType: learnerScriptReports.reportType,
        configJson: learnerScriptReports.configJson,
      })
      .from(learnerScriptReports)
      .where(eq(learnerScriptReports.isActive, true))
      .orderBy(asc(learnerScriptReports.title)),
    buildCourseProgressReport(userId),
  ])

  return {
    canManageReports: userRole !== 'student',
    manageReportsUrl: userRole !== 'student' ? '/reports/learner-script/manage' : null,
    reports: reports.map((r) => ({
      key: r.key,
      title: r.title,
      description: r.description,
      reportType: r.reportType,
      metrics: Array.isArray(r.configJson.metrics) ? r.configJson.metrics : [],
    })),
    snapshot: progressSnapshot.summary,
  }
}

export async function getLearnerScriptReportByKey(
  userId: string,
  userRole: string,
  key: string,
  options: { courseId?: number } = {},
) {
  const [report] = await db
    .select()
    .from(learnerScriptReports)
    .where(and(eq(learnerScriptReports.key, key), eq(learnerScriptReports.isActive, true)))
    .limit(1)

  if (!report) {
    throw new NotFoundError('LearnerScript report not found')
  }

  let resolvedCourseId: number | undefined
  if (options.courseId !== undefined) {
    const { course } = await requireEnrolledCourse(userId, options.courseId)
    resolvedCourseId = course.id
  }

  const builder = REPORT_BUILDERS[report.reportType]
  if (!builder) {
    throw new NotFoundError(`Report type '${report.reportType}' is not supported`)
  }

  const payload = await builder(userId, resolvedCourseId)

  return {
    report: {
      key: report.key,
      title: report.title,
      description: report.description,
      reportType: report.reportType,
      config: report.configJson,
      canManageReports: userRole !== 'student',
    },
    columns: payload.columns,
    rows: payload.rows,
    summary: payload.summary,
  }
}
