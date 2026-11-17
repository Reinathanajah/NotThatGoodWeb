import './reports.css'
import type { CourseProgressRow } from '../../lib/reportRows.ts'

interface AnalyticsProgressChartProps {
  rows: CourseProgressRow[]
}

export function AnalyticsProgressChart({ rows }: AnalyticsProgressChartProps) {
  const rowHeight = 64
  const svgHeight = Math.max(120, rows.length * rowHeight + 28)

  return (
    <section className="sf-surface rep-chart-card sf-stack" aria-labelledby="progress-chart-heading">
      <div className="dash-controls">
        <h2 id="progress-chart-heading" className="sf-heading-section">
          Course module completion
        </h2>
        <div className="sf-row">
          <span className="rep-pill">
            <span className="rep-pill-dot" style={{ backgroundColor: 'var(--accent)' }} aria-hidden="true" />
            <span>Completion %</span>
          </span>
          <span className="rep-pill">
            <span className="rep-pill-dot" style={{ backgroundColor: 'var(--status-success)' }} aria-hidden="true" />
            <span>Quiz avg %</span>
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 720 ${svgHeight}`}
        className="rep-chart-svg"
        role="img"
        aria-label="Course module completion and quiz average percentage chart"
      >
        <title>Course module completion across enrolled courses</title>
        <desc>
          Horizontal comparison of module completion percentage and quiz average score per course.
        </desc>
        {rows.map((row, idx) => {
          const y = idx * rowHeight + 12
          const completion = Math.max(0, Math.min(100, row.completionRatePercent ?? 0))
          const quizAvg = Math.max(0, Math.min(100, row.quizAverageScore ?? 0))
          const barMax = 380
          const completionWidth = (completion / 100) * barMax
          const quizWidth = (quizAvg / 100) * barMax

          return (
            <g key={row.courseId} transform={`translate(0, ${y})`}>
              <text
                x="0"
                y="18"
                fontSize="14"
                fontWeight="600"
                fill="var(--text-primary)"
              >
                {row.courseCode}
              </text>
              <rect
                x="170"
                y="4"
                width={barMax}
                height="14"
                rx="4"
                fill="var(--bg-surface-raised)"
                stroke="var(--border-subtle)"
              />
              {completionWidth > 0 ? (
                <rect x="170" y="4" width={completionWidth} height="14" rx="4" fill="var(--accent)" />
              ) : null}
              <text x="564" y="16" fontSize="14" fill="var(--text-primary)">
                {row.completionRatePercent !== null
                  ? `${row.completionRatePercent.toFixed(1)}% (${row.completedModules}/${row.totalTrackableModules})`
                  : 'No trackable items'}
              </text>

              <rect
                x="170"
                y="24"
                width={barMax}
                height="12"
                rx="4"
                fill="var(--bg-surface-raised)"
                stroke="var(--border-subtle)"
              />
              {quizWidth > 0 ? (
                <rect x="170" y="24" width={quizWidth} height="12" rx="4" fill="var(--status-success)" />
              ) : null}
              <text x="564" y="35" fontSize="14" fill="var(--text-secondary)">
                Quiz avg: {row.quizAverageScore !== null ? `${row.quizAverageScore.toFixed(1)}%` : '-'}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
