import { Laptop, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { listBrowserSessions, revokeBrowserSession } from '../../services/authApi.ts'
import type { BrowserSessionDto } from '../../types/auth.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

export function BrowserSessionsCard({ timeZone }: { timeZone: string }) {
  const [sessions, setSessions] = useState<BrowserSessionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listBrowserSessions(controller.signal).then(
      (rows) => {
        if (controller.signal.aborted) return
        setSessions(rows)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load sessions')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [])

  async function handleRevoke(id: string) {
    setRevokingId(id)
    setError(null)
    try {
      const res = await revokeBrowserSession(id)
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, revokedAt: res.revokedAt, isActive: false } : s)),
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not revoke session')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-labelledby="sessions-heading">
      <h2 id="sessions-heading" className="sf-heading-section sf-row">
        <Laptop size={20} color="var(--accent)" aria-hidden="true" />
        <span>Browser sessions</span>
      </h2>

      {error ? <StatusBanner variant="error" title="Session error" message={error} /> : null}

      {loading ? (
        <StatusBanner variant="loading" title="Loading active sessions" skeletonLines={3} />
      ) : (
        <ul className="assign-file-list">
          {sessions.map((s) => (
            <li key={s.id} className="assign-file-row">
              <div className="sf-stack" style={{ gap: '2px', flex: '1 1 200px' }}>
                <strong>
                  {s.isCurrent ? 'Current browser session' : s.isActive ? 'Active session' : 'Revoked session'}
                </strong>
                <span className="sf-text-muted">{s.userAgent || 'Standard client'} · {s.ipAddress || 'IP logged'}</span>
                <span className="sf-text-muted tabular-nums">
                  Last active {formatDateTimeShort(s.lastActiveAt, timeZone)}
                </span>
              </div>
              {s.isCurrent ? (
                <span className="sf-badge">Current</span>
              ) : s.isActive ? (
                <button
                  type="button"
                  className="sf-btn sf-btn--secondary"
                  disabled={revokingId === s.id}
                  onClick={() => void handleRevoke(s.id)}
                >
                  <ShieldAlert size={15} aria-hidden="true" />
                  <span>{revokingId === s.id ? 'Revoking...' : 'Revoke'}</span>
                </button>
              ) : (
                <span className="sf-text-muted">Revoked</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
