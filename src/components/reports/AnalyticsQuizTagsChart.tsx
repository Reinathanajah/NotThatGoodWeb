import './reports.css'
import type { QuizTagRow } from '../../lib/reportRows.ts'

interface AnalyticsQuizTagsChartProps {
  rows: QuizTagRow[]
}

export function AnalyticsQuizTagsChart({ rows }: AnalyticsQuizTagsChartProps) {
  const rowHeight = 52
  const svgHeight = Math.max(110, rows.length * rowHeight + 24)

  return (
    <section className="sf-surface rep-chart-card sf-stack" aria-labelledby="quiz-tags-chart-heading">
      <div className="dash-controls">
        <h2 id="quiz-tags-chart-heading" className="sf-heading-section">
          Topic accuracy by tag
        </h2>
        <span className="sf-text-muted">Measured from attempted tagged questions</span>
      </div>

      <svg
        viewBox={`0 0 720 ${svgHeight}`}
        className="rep-chart-svg"
        role="img"
        aria-label="Quiz accuracy percentage broken down by question topic tag"
      >
        <title>Quiz accuracy by topic tag</title>
        <desc>Horizontal percentage bars displaying correct response rate per question tag.</desc>
        {rows.map((row, idx) => {
          const y = idx * rowHeight + 12
          const accuracy = Math.max(0, Math.min(100, row.accuracyPercent ?? 0))
          const barMax = 370
          const barWidth = (accuracy / 100) * barMax

          return (
            <g key={row.tag} transform={`translate(0, ${y})`}>
              <text x="0" y="22" fontSize="14" fontWeight="600" fill="var(--text-primary)">
                {row.tag}
              </text>
              <rect
                x="180"
                y="8"
                width={barMax}
                height="18"
                rx="4"
                fill="var(--bg-surface-raised)"
                stroke="var(--border-subtle)"
              />
              {barWidth > 0 ? (
                <rect x="180" y="8" width={barWidth} height="18" rx="4" fill="var(--accent)" />
              ) : null}
              <text x="564" y="22" fontSize="14" fill="var(--text-primary)">
                {row.accuracyPercent !== null
                  ? `${row.accuracyPercent.toFixed(1)}% (${row.correctCount}/${row.attemptedQuestionsCount})`
                  : 'No attempts'}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
