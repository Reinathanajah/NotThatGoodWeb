import { Link } from 'wouter'
import type { LearnerScriptListDto } from '../../types/reports.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

export function AnalyticsCatalogGrid({ catalog }: { catalog: LearnerScriptListDto | null }) {
  return (
    <section className="sf-surface cat-header-card sf-stack" aria-label="Configured analytics reports">
      <StatusBanner
        variant="info"
        title={catalog?.canManageReports ? 'Instructor analytics access enabled' : 'Read-only report catalog'}
        message="Select any active analytics view below to inspect live metrics and breakdowns."
      />
      <div className="guide-links-grid">
        {(catalog?.reports ?? []).map((item) => (
          <Link key={item.key} href={`/reports/analytics/${item.key}`} className="cat-subcat-tile">
            <strong>{item.title}</strong>
            {item.description ? <span className="sf-text-muted">{item.description}</span> : null}
          </Link>
        ))}
      </div>
    </section>
  )
}
