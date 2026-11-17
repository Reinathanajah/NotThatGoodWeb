import { RefreshCw, ScanSearch } from 'lucide-react'
import { useAuth } from '../../context/authContextValue.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import type { AssignmentFileDto, PlagiarismJobDto } from '../../types/activities.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface PlagiarismPanelProps {
  provider: string | null
  files: AssignmentFileDto[]
  jobs: PlagiarismJobDto[]
  scanning: boolean
  scanError: string | null
  onRunScan: () => void
}

const JOB_LABELS: Record<PlagiarismJobDto['status'], string> = {
  pending: 'Queued',
  scanning: 'Scanning document',
  completed: 'Scan complete',
  failed: 'Scan failed',
}

export function PlagiarismPanel({
  provider,
  files,
  jobs,
  scanning,
  scanError,
  onRunScan,
}: PlagiarismPanelProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'

  if (!provider) {
    return (
      <section className="sf-surface res-stage-card sf-stack" aria-labelledby="plagiarism-heading">
        <h2 id="plagiarism-heading" className="sf-heading-section">
          Similarity check
        </h2>
        <p className="sf-text-muted">Plagiarism screening is not enabled for this assignment.</p>
      </section>
    )
  }

  const fileNames = new Map(files.map((f) => [f.id, f.displayName]))
  const activeScan = jobs.some((j) => j.status === 'pending' || j.status === 'scanning')

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-labelledby="plagiarism-heading">
      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 280px' }}>
          <h2 id="plagiarism-heading" className="sf-heading-section">
            Originality check ({provider})
          </h2>
          <p className="sf-text-muted">
            Analyzes attached submission files for text overlap and generates a similarity score.
          </p>
        </div>

        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          disabled={scanning || activeScan || files.length === 0}
          onClick={onRunScan}
        >
          {scanning || activeScan ? (
            <RefreshCw size={16} aria-hidden="true" />
          ) : (
            <ScanSearch size={16} aria-hidden="true" />
          )}
          <span>{scanning ? 'Starting scan...' : 'Run plagiarism scan'}</span>
        </button>
      </div>

      {scanError ? (
        <StatusBanner variant="error" title="Plagiarism check failed" message={scanError} />
      ) : null}

      {files.length === 0 ? (
        <p className="sf-text-muted">
          Attach and save at least one submission file before running a plagiarism scan.
        </p>
      ) : jobs.length === 0 ? (
        <p className="sf-text-muted">
          Files attached cleanly. Select Run plagiarism scan to check similarity.
        </p>
      ) : (
        <ul className="assign-file-list">
          {jobs.map((job) => {
            const pct = job.similarityPercent !== null ? Number(job.similarityPercent) : null
            const safePct = pct !== null && Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : null
            const label = job.fileName ?? fileNames.get(job.fileObjectId) ?? 'Submitted file'
            return (
              <li key={job.id} className="assign-plag-job">
                <div className="sf-stack" style={{ gap: '4px', flex: '1 1 220px' }}>
                  <strong>{label}</strong>
                  <span className="sf-text-muted tabular-nums">
                    {JOB_LABELS[job.status]} · Updated {formatDateTimeShort(job.updatedAt, tz)}
                  </span>
                </div>

                {safePct !== null ? (
                  <div className="sf-stack" style={{ gap: '4px', minWidth: '180px' }}>
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>
                      {safePct.toFixed(1)}% similarity
                    </span>
                    <div
                      className="assign-meter-track"
                      role="progressbar"
                      aria-label={`${label} similarity`}
                      aria-valuenow={Math.round(safePct)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="assign-meter-fill" style={{ width: `${safePct}%` }} />
                    </div>
                  </div>
                ) : (
                  <span className="assign-state-chip assign-state-chip--warn">
                    {JOB_LABELS[job.status]}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
