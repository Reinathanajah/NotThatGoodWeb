import { Calendar, ChevronRight, Clock, ShieldCheck } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { getAssignmentWindowState } from '../../lib/assignmentTime.ts'
import { resolveCategoryHref, resolveCourseHref } from '../../lib/appRoutes.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { AssignmentDetailDto } from '../../types/activities.ts'
import { SafeHtmlBlock } from '../ui/SafeHtmlBlock.tsx'

interface AssignmentHeaderCardProps {
  detail: AssignmentDetailDto
  nowMs: number
}

export function AssignmentHeaderCard({ detail, nowMs }: AssignmentHeaderCardProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const windowState = getAssignmentWindowState(detail.opensAt, detail.dueAt, detail.cutoffAt, nowMs)
  const { submissionStatus, rules } = detail
  const canEdit =
    windowState !== 'upcoming' &&
    windowState !== 'closed' &&
    submissionStatus.gradingStatus !== 'graded' &&
    submissionStatus.attemptNumber <= rules.maxAttempts

  const lockNote =
    submissionStatus.gradingStatus === 'graded'
      ? 'This submission has already been graded.'
      : windowState === 'upcoming' && detail.opensAt
        ? `Submissions open on ${formatDateTimeShort(detail.opensAt, tz)}.`
        : windowState === 'closed' && detail.cutoffAt
          ? `Cut-off passed on ${formatDateTimeShort(detail.cutoffAt, tz)}.`
          : null

  return (
    <header className="sf-surface cat-header-card sf-stack" aria-labelledby="assignment-title">
      <nav aria-label="Assignment breadcrumb">
        <ol className="cat-breadcrumb-list">
          {detail.breadcrumbs.map((crumb) => (
            <Fragment key={crumb.id}>
              <li className="cat-breadcrumb-item">
                <Link href={resolveCategoryHref(crumb)}>{crumb.name}</Link>
                <ChevronRight size={16} aria-hidden="true" />
              </li>
            </Fragment>
          ))}
          <li className="cat-breadcrumb-item">
            <Link href={resolveCourseHref(detail.course)}>
              {detail.course.code} · {detail.course.title}
            </Link>
            <ChevronRight size={16} aria-hidden="true" />
          </li>
          {detail.section ? (
            <li className="cat-breadcrumb-item">
              <span>{detail.section.title}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </li>
          ) : null}
          <li className="cat-breadcrumb-item">
            <span aria-current="page" style={{ fontWeight: 600 }}>
              {detail.title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 320px' }}>
          <h1 id="assignment-title" className="sf-heading-display">
            {detail.title}
          </h1>
          <p className="sf-text-muted tabular-nums">
            {detail.subsectionLabel ? `${detail.subsectionLabel} · ` : ''}
            Up to {rules.maxFiles} files · Max {formatBytes(rules.maxFileSizeBytes)} per file ·{' '}
            {rules.maxAttempts} {rules.maxAttempts === 1 ? 'attempt' : 'attempts'} · Max grade{' '}
            {Number(rules.maxGrade)}
          </p>
        </div>

        {canEdit ? (
          <Link href={`/assignments/${detail.moduleId}/edit`} className="sf-btn sf-btn--primary">
            {submissionStatus.status === 'none' ? 'Add submission' : 'Edit submission'}
          </Link>
        ) : (
          <span className="assign-state-chip assign-state-chip--warn">{lockNote ?? 'Locked'}</span>
        )}
      </div>

      <div className="assign-dates-bar tabular-nums">
        {detail.opensAt ? (
          <span className="assign-date-item">
            <Calendar size={16} color="var(--accent)" aria-hidden="true" />
            <strong>Opened:</strong> {formatDateTimeShort(detail.opensAt, tz)}
          </span>
        ) : null}
        <span className="assign-date-item">
          <Clock size={16} color="var(--accent)" aria-hidden="true" />
          <strong>Due:</strong> {formatDateTimeShort(detail.dueAt, tz)}
        </span>
        {detail.cutoffAt ? (
          <span className="assign-date-item">
            <Clock size={16} color="var(--text-secondary)" aria-hidden="true" />
            <strong>Cut-off:</strong> {formatDateTimeShort(detail.cutoffAt, tz)}
          </span>
        ) : null}
      </div>

      {detail.descriptionHtml ? <SafeHtmlBlock html={detail.descriptionHtml} /> : null}

      {rules.requireSubmissionStatement && rules.submissionStatementText ? (
        <details className="assign-integrity-disclosure">
          <summary className="sf-row">
            <ShieldCheck size={16} color="var(--accent)" aria-hidden="true" />
            <span>Academic integrity statement (required on final submit)</span>
          </summary>
          <p className="sf-text-muted" style={{ whiteSpace: 'pre-line', marginTop: 'var(--space-2)' }}>
            {rules.submissionStatementText}
          </p>
        </details>
      ) : null}
    </header>
  )
}
