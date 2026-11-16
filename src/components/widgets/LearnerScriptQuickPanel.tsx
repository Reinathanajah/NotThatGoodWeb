import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import { fetchLearnerScriptList } from '../../services/widgetsApi.ts'
import type { LearnerScriptListDto } from '../../types/reports.ts'

export function LearnerScriptQuickPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { strings } = useI18n()
  const [data, setData] = useState<LearnerScriptListDto | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchLearnerScriptList(controller.signal).then(setData, () => {})
    return () => controller.abort()
  }, [])

  return (
    <section className="sf-stack" aria-labelledby="analytics-reports-heading">
      <h3 id="analytics-reports-heading" className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
        {strings.dashboard.learnerScript}
      </h3>

      <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        {data?.reports.map((report) => (
          <Link
            key={report.key}
            href={`/reports/analytics/${report.key}`}
            className="clock-readout-row"
            style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
            onClick={onNavigate}
          >
            <strong>{report.title}</strong>
            {report.description ? <span className="sf-text-muted">{report.description}</span> : null}
          </Link>
        ))}

        {data?.canManageReports && data.manageReportsUrl ? (
          <Link href={data.manageReportsUrl} onClick={onNavigate}>
            Manage reports
          </Link>
        ) : null}
      </div>
    </section>
  )
}
