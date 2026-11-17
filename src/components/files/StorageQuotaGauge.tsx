import { formatBytes } from '../../lib/formatBytes.ts'

interface StorageQuotaGaugeProps {
  usedBytes: number
  quotaBytes: number
  remainingBytes: number
}

export function StorageQuotaGauge({
  usedBytes,
  quotaBytes,
  remainingBytes,
}: StorageQuotaGaugeProps) {
  const pct = quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0

  return (
    <div className="pf-quota-card tabular-nums">
      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <strong>
          {formatBytes(usedBytes)} used of {formatBytes(quotaBytes)}
        </strong>
        <span className="sf-text-muted">
          {pct.toFixed(1)}% · {formatBytes(remainingBytes)} free
        </span>
      </div>
      <div
        className="pf-quota-track"
        role="progressbar"
        aria-label="Private storage usage"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="pf-quota-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
