import './reports.css'

export interface SummaryMetric {
  label: string
  value: string
  hint?: string
}

interface GradebookSummaryStripProps {
  ariaLabel: string
  metrics: SummaryMetric[]
}

export function GradebookSummaryStrip({ ariaLabel, metrics }: GradebookSummaryStripProps) {
  return (
    <section className="rep-kpi-grid" aria-label={ariaLabel}>
      {metrics.map((item) => (
        <article key={item.label} className="rep-kpi-card">
          <span className="sf-text-muted" style={{ fontWeight: 600 }}>
            {item.label}
          </span>
          <strong className="rep-kpi-value tabular-nums">{item.value}</strong>
          {item.hint ? <span className="sf-text-muted">{item.hint}</span> : null}
        </article>
      ))}
    </section>
  )
}
