import '../components/reports/reports.css'
import { BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import {
  AnalyticsProgressTable,
  AnalyticsQuizTagsTable,
} from '../components/reports/AnalyticsBreakdownTable.tsx'
import { AnalyticsCatalogGrid } from '../components/reports/AnalyticsCatalogGrid.tsx'
import { AnalyticsProgressChart } from '../components/reports/AnalyticsProgressChart.tsx'
import { AnalyticsQuizTagsChart } from '../components/reports/AnalyticsQuizTagsChart.tsx'
import { GradebookSummaryStrip } from '../components/reports/GradebookSummaryStrip.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAnalyticsReport } from '../hooks/useAnalyticsReport.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import {
  buildAnalyticsSummaryMetrics,
  parseCourseProgressRows,
  parseQuizTagRows,
} from '../lib/reportRows.ts'

export function AnalyticsReportsPage() {
  const params = useParams<{ key?: string }>()
  const [courseFilter, setCourseFilter] = useState('')
  const { isManageView, activeReportKey, catalog, allCourseOpts, detail, error, isLoading, retry } =
    useAnalyticsReport(params.key ?? 'student-progress', courseFilter)

  useDocumentTitle(detail ? detail.report.title : 'Learning analytics')

  const progressRows =
    detail?.report.reportType === 'course_progress' ? parseCourseProgressRows(detail.rows) : []
  const tagRows =
    detail?.report.reportType === 'quiz_tags' ? parseQuizTagRows(detail.rows) : []

  return (
    <AppShell>
      <header className="sf-surface cat-header-card sf-stack" style={{ gap: 'var(--space-3)' }}>
        <div className="dash-controls">
          <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 280px' }}>
            <div className="sf-row">
              <BarChart3 size={22} aria-hidden="true" color="var(--accent)" />
              <h1 className="sf-heading-display">
                {isManageView
                  ? 'Analytics catalog management'
                  : detail?.report.title ?? 'Learning analytics'}
              </h1>
            </div>
            <p className="sf-text-muted">
              {isManageView
                ? 'Active analytics definitions configured in SilverFour.'
                : detail?.report.description ??
                  'Inspect completion trends, submissions, and quiz topic accuracy.'}
            </p>
          </div>
          {activeReportKey === 'student-progress' && !isManageView && allCourseOpts.length > 0 ? (
            <div className="sf-row">
              <label htmlFor="analytics-course-filter" className="sf-sr-only">
                Filter report by course
              </label>
              <select
                id="analytics-course-filter"
                className="sf-input dash-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">All enrolled courses</option>
                {allCourseOpts.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <nav className="rep-tab-strip" aria-label="Available analytics reports">
          {(catalog?.reports ?? []).map((item) => (
            <Link
              key={item.key}
              href={`/reports/analytics/${item.key}`}
              className={`sf-btn ${
                !isManageView && item.key === activeReportKey ? 'sf-btn--primary' : 'sf-btn--secondary'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </header>

      {isManageView ? (
        <AnalyticsCatalogGrid catalog={catalog} />
      ) : isLoading ? (
        <StatusBanner variant="loading" title="Loading analytics report" skeletonLines={4} />
      ) : error || !detail ? (
        <StatusBanner
          variant="error"
          title="Could not load analytics report"
          message={error ?? 'Requested analytics report was not found.'}
          actionLabel="Retry"
          onAction={retry}
        />
      ) : (
        <div className="sf-stack">
          <GradebookSummaryStrip ariaLabel="Report summary" metrics={buildAnalyticsSummaryMetrics(detail)} />
          {detail.report.reportType === 'course_progress' ? (
            progressRows.length === 0 ? (
              <StatusBanner
                variant="empty"
                title="No course activity yet"
                message="Enroll in a course or complete modules to inspect progress metrics."
              />
            ) : (
              <>
                <AnalyticsProgressChart rows={progressRows} />
                <AnalyticsProgressTable rows={progressRows} />
              </>
            )
          ) : tagRows.length === 0 ? (
            <StatusBanner
              variant="empty"
              title="No quiz tag records yet"
              message="Attempt tagged quiz questions to inspect topic accuracy breakdown."
            />
          ) : (
            <>
              <AnalyticsQuizTagsChart rows={tagRows} />
              <AnalyticsQuizTagsTable rows={tagRows} />
            </>
          )}
        </div>
      )}
    </AppShell>
  )
}
