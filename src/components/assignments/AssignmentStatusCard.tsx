import { AlertTriangle, CheckCircle2, Clock, FileEdit } from 'lucide-react'
import { useAuth } from '../../context/authContextValue.ts'
import { computeLiveTimeRemaining } from '../../lib/assignmentTime.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import type { AssignmentDetailDto } from '../../types/activities.ts'
import { SafeHtmlBlock } from '../ui/SafeHtmlBlock.tsx'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { AssignmentFilesList } from './AssignmentFilesList.tsx'

interface AssignmentStatusCardProps {
  detail: AssignmentDetailDto
  nowMs: number
  downloadingFileId: string | null
  downloadError: string | null
  onDownloadFile: (fileId: string, fileName: string) => void
}

const STATUS_META = {
  none: { label: 'No attempt submitted', tone: '' },
  draft: { label: 'Draft (not submitted)', tone: 'assign-state-chip--warn' },
  submitted: { label: 'Submitted for grading', tone: 'assign-state-chip--done' },
  submitted_late: { label: 'Submitted late', tone: 'assign-state-chip--warn' },
} as const

export function AssignmentStatusCard({
  detail,
  nowMs,
  downloadingFileId,
  downloadError,
  onDownloadFile,
}: AssignmentStatusCardProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const statusInfo = detail.submissionStatus
  const chip = STATUS_META[statusInfo.status]
  const liveRemaining = computeLiveTimeRemaining(detail.dueAt, statusInfo.submittedAt, nowMs)

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-labelledby="submission-status-heading">
      <h2 id="submission-status-heading" className="sf-heading-section">
        Submission status
      </h2>

      {downloadError ? (
        <StatusBanner variant="error" title="File download failed" message={downloadError} />
      ) : null}

      <dl className="assign-status-dl tabular-nums">
        <div className="assign-status-row">
          <dt>Attempt number</dt>
          <dd>
            This is attempt {statusInfo.attemptNumber} of {detail.rules.maxAttempts}
          </dd>
        </div>

        <div className="assign-status-row">
          <dt>Submission status</dt>
          <dd>
            <span className={`assign-state-chip ${chip.tone}`}>
              {statusInfo.status === 'submitted' ? (
                <CheckCircle2 size={15} aria-hidden="true" />
              ) : (
                <FileEdit size={15} aria-hidden="true" />
              )}
              <span>{chip.label}</span>
            </span>
          </dd>
        </div>

        <div className="assign-status-row">
          <dt>Grading status</dt>
          <dd>
            {statusInfo.grade ? (
              <span className="assign-state-chip assign-state-chip--done">
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>
                  Graded ({statusInfo.grade.score} / {statusInfo.grade.maxGrade})
                </span>
              </span>
            ) : (
              <span>Not graded</span>
            )}
          </dd>
        </div>

        <div className="assign-status-row">
          <dt>Time remaining</dt>
          <dd>
            <span
              className={`assign-state-chip ${
                liveRemaining.isOverdue && !statusInfo.submittedAt ? 'assign-state-chip--error' : ''
              }`}
            >
              {liveRemaining.isOverdue && !statusInfo.submittedAt ? (
                <AlertTriangle size={15} aria-hidden="true" />
              ) : (
                <Clock size={15} aria-hidden="true" />
              )}
              <span>{liveRemaining.humanReadable}</span>
            </span>
          </dd>
        </div>

        <div className="assign-status-row">
          <dt>Last modified</dt>
          <dd>
            {statusInfo.lastModifiedAt
              ? formatDateTimeShort(statusInfo.lastModifiedAt, tz)
              : 'No edits recorded yet'}
          </dd>
        </div>

        {statusInfo.onlineText ? (
          <div className="assign-status-row">
            <dt>Online text</dt>
            <dd>
              <SafeHtmlBlock html={statusInfo.onlineText} />
            </dd>
          </div>
        ) : null}

        <div className="assign-status-row">
          <dt>File submissions</dt>
          <dd>
            <AssignmentFilesList
              files={statusInfo.files}
              timeZone={tz}
              downloadingFileId={downloadingFileId}
              onDownloadFile={onDownloadFile}
            />
          </dd>
        </div>

        {statusInfo.grade?.feedback ? (
          <div className="assign-status-row">
            <dt>Instructor feedback</dt>
            <dd>
              <SafeHtmlBlock html={statusInfo.grade.feedback} />
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
