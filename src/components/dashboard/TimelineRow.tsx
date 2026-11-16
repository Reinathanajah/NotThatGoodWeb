import { ClipboardCheck, FileUp } from 'lucide-react'
import { Link } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import { formatTime24 } from '../../lib/dateFormat.ts'
import { resolveModuleHref } from '../../lib/appRoutes.ts'
import type { TimelineItemDto } from '../../types/courses.ts'

interface TimelineRowProps {
  item: TimelineItemDto
  timeZone: string
}

export function TimelineRow({ item, timeZone }: TimelineRowProps) {
  const { strings } = useI18n()
  const Icon = item.moduleType === 'quiz' ? ClipboardCheck : FileUp

  return (
    <Link href={resolveModuleHref(item)} className="timeline-row motion-surface">
      <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
        <span className="tabular-nums sf-text-muted" style={{ minWidth: '54px' }}>
          {formatTime24(item.dueAt, timeZone)}
        </span>
        <Icon size={18} color="var(--accent)" aria-hidden="true" />
      </div>

      <div className="sf-stack" style={{ gap: '2px' }}>
        <strong style={{ fontSize: 'var(--text-body)' }}>{item.title}</strong>
        <span className="sf-text-muted">
          {item.actionLabel} · {item.course.title}
        </span>
      </div>

      <div>
        {item.status === 'overdue' ? (
          <span className="timeline-overdue-pill">{strings.dashboard.overdueBadge}</span>
        ) : item.status === 'submitted' ? (
          <span className="timeline-submitted-pill">Submitted</span>
        ) : (
          <span className="sf-text-muted" style={{ fontWeight: 600 }}>
            {item.moduleType === 'quiz' ? 'Quiz' : 'Assignment'}
          </span>
        )}
      </div>
    </Link>
  )
}
