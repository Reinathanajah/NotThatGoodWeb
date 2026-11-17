import { ClipboardCheck, FileText, FileUp, Info, Link2 } from 'lucide-react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { resolveModuleHref } from '../../lib/appRoutes.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { CourseModuleDto } from '../../types/courses.ts'
import { SafeHtmlBlock } from '../ui/SafeHtmlBlock.tsx'

interface CourseModuleRowProps {
  courseId: number
  mod: CourseModuleDto
  pending: boolean
  onToggleComplete: (moduleId: number, nextCompleted: boolean) => void
}

const TYPE_ICONS = {
  assign: FileUp,
  quiz: ClipboardCheck,
  resource: FileText,
  url: Link2,
  label: Info,
} as const

function buildResourceMeta(mod: CourseModuleDto, tz: string): string | null {
  const file = mod.resource?.file
  if (!file) return null
  const kind = (mod.resource?.resourceKind || 'file').toUpperCase()
  return `${kind} · ${formatBytes(file.sizeBytes)} · Uploaded ${formatDateTimeShort(file.uploadedAt, tz)}`
}

export function CourseModuleRow({
  courseId,
  mod,
  pending,
  onToggleComplete,
}: CourseModuleRowProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const Icon = TYPE_ICONS[mod.moduleType]

  if (mod.moduleType === 'label') {
    return (
      <div className="course-mod-label sf-stack" style={{ gap: 'var(--space-1)' }}>
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <Icon size={17} color="var(--accent)" aria-hidden="true" />
          <strong>{mod.title}</strong>
        </div>
        {mod.descriptionHtml ? <SafeHtmlBlock html={mod.descriptionHtml} /> : null}
      </div>
    )
  }

  const internalHref = resolveModuleHref({ ...mod, courseId })
  const resourceMeta = buildResourceMeta(mod, tz)

  return (
    <div className="course-mod-row">
      <div className="sf-stack" style={{ gap: '6px', flex: '1 1 280px' }}>
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <Icon size={18} color="var(--accent)" aria-hidden="true" />
          <Link href={internalHref} className="course-mod-title">
            {mod.title}
          </Link>
        </div>

        <p className="sf-text-muted tabular-nums">
          {mod.subsectionLabel ? `${mod.subsectionLabel} · ` : ''}
          {resourceMeta ?? mod.moduleType.toUpperCase()}
          {mod.opensAt ? ` · Opens ${formatDateTimeShort(mod.opensAt, tz)}` : ''}
          {mod.dueOrClosedAt
            ? ` · ${mod.moduleType === 'quiz' ? 'Closes' : 'Due'} ${formatDateTimeShort(mod.dueOrClosedAt, tz)}`
            : ''}
        </p>

        {mod.descriptionHtml ? <SafeHtmlBlock html={mod.descriptionHtml} /> : null}
      </div>

      {mod.completionTrackable ? (
        <label
          className={`course-complete-check${mod.isCompleted ? ' course-complete-check--done' : ''}`}
        >
          <input
            type="checkbox"
            checked={mod.isCompleted}
            disabled={pending}
            aria-label={`Mark ${mod.title} as ${mod.isCompleted ? 'incomplete' : 'complete'}`}
            onChange={(e) => onToggleComplete(mod.id, e.target.checked)}
          />
          <span>{mod.isCompleted ? 'Done' : 'Mark done'}</span>
        </label>
      ) : null}
    </div>
  )
}
