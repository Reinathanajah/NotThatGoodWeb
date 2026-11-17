import { ExternalLink, Radio, Video } from 'lucide-react'
import { isSafeHttpUrl } from '../../lib/formatBytes.ts'
import type { ResourceDetailDto } from '../../types/courses.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

function isSeededCampusHost(urlString: string): boolean {
  try {
    const parsed = new URL(urlString)
    return parsed.hostname.endsWith('.silverfour.edu')
  } catch {
    return false
  }
}

export function ResourceUrlPanel({ detail }: { detail: ResourceDetailDto }) {
  const safeUrl = isSafeHttpUrl(detail.externalUrl)
  const isMeet = safeUrl?.includes('meet.') ?? false
  const Icon = isMeet ? Radio : Video

  if (!safeUrl) {
    return (
      <StatusBanner
        variant="empty"
        title="No media link configured"
        message="This activity does not currently include an external media URL."
      />
    )
  }

  if (isSeededCampusHost(safeUrl)) {
    return (
      <section className="sf-surface res-stage-card sf-stack" aria-label={detail.title}>
        <div className="dash-controls">
          <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
            <Icon size={20} color="var(--accent)" aria-hidden="true" />
            <h2 className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
              {isMeet ? 'Scheduled live session room' : 'Recorded lecture stream'}
            </h2>
          </div>
          <span className="sf-badge">Course media</span>
        </div>
        <StatusBanner
          variant="info"
          title="Demo media endpoint"
          message={
            isMeet
              ? `Live session room (${safeUrl}) is configured as a demo placeholder. Check your course syllabus notes for schedule details or mark this item done once attended.`
              : `Lecture stream (${safeUrl}) is configured as a seeded demo reference. Mark this module done using the completion toggle above or continue to the next course activity below.`
          }
        />
      </section>
    )
  }

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-label="External learning resource">
      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 260px' }}>
          <h2 className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
            External course resource
          </h2>
          <p className="sf-text-muted" style={{ overflowWrap: 'anywhere' }}>
            {safeUrl}
          </p>
        </div>
        <a href={safeUrl} target="_blank" rel="noreferrer noopener" className="sf-btn sf-btn--primary">
          <span>Open resource</span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
