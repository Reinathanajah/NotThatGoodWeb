import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/authContextValue.ts'
import { useI18n } from '../../context/i18nContextValue.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { fetchClockStatus } from '../../services/widgetsApi.ts'
import type { ClockResponseDto } from '../../types/workspace.ts'

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Jakarta',
  'Australia/Sydney',
] as const

export function TimezoneClockPanel() {
  const { user } = useAuth()
  const { strings } = useI18n()
  const [deltaMs, setDeltaMs] = useState(0)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [targetZone, setTargetZone] = useState('UTC')
  const [inputIsoLocal, setInputIsoLocal] = useState('')
  const [converted, setConverted] = useState<ClockResponseDto | null>(null)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchClockStatus({}, controller.signal).then(
      (res) => {
        const serverMs = Date.parse(res.utcIso)
        if (!Number.isNaN(serverMs)) {
          setDeltaMs(serverMs - Date.now())
        }
      },
      () => { },
    )
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [])

  const syncedIso = new Date(nowMs + deltaMs).toISOString()
  const userZone = user?.timezone ?? 'UTC'
  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault()
    setConverting(true)
    try {
      const timestamp = inputIsoLocal ? new Date(inputIsoLocal).toISOString() : undefined
      const res = await fetchClockStatus({ targetTimezone: targetZone, timestamp })
      setConverted(res)
    } finally {
      setConverting(false)
    }
  }

  return (
    <section className="sf-stack" aria-labelledby="clock-widget-title">
      <h3 id="clock-widget-title" className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
        {strings.dashboard.timezoneClock}
      </h3>

      <div className="clock-readout-row">
        <span className="sf-text-muted">Server (UTC)</span>
        <strong className="tabular-nums">{formatDateTimeShort(syncedIso, 'UTC')}</strong>
      </div>

      <div className="clock-readout-row">
        <span className="sf-text-muted">User ({userZone})</span>
        <strong className="tabular-nums">{formatDateTimeShort(syncedIso, userZone)}</strong>
      </div>

      <div className="clock-readout-row">
        <span className="sf-text-muted">Your device ({deviceZone})</span>
        <strong className="tabular-nums">{formatDateTimeShort(syncedIso, deviceZone)}</strong>
      </div>

      <details className="sf-disclosure">
        <summary>Deadline converter</summary>
        <form className="sf-stack" style={{ marginTop: 'var(--space-3)' }} onSubmit={(e) => void handleConvert(e)}>
          <div className="foundation-field">
            <label htmlFor="clock-input-dt">Reference date & time (optional)</label>
            <input
              id="clock-input-dt"
              type="datetime-local"
              value={inputIsoLocal}
              onChange={(e) => setInputIsoLocal(e.target.value)}
            />
          </div>
          <div className="foundation-field">
            <label htmlFor="clock-target-tz">Target timezone</label>
            <select
              id="clock-target-tz"
              className="dash-select"
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
            >
              {COMMON_TIMEZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="sf-btn sf-btn--secondary" disabled={converting}>
            {converting ? 'Converting...' : 'Convert time'}
          </button>

          {converted ? (
            <div className="clock-readout-row">
              <span className="sf-text-muted">
                {converted.converted.timezone} ({converted.converted.offset})
              </span>
              <strong className="tabular-nums">{converted.converted.formatted}</strong>
            </div>
          ) : null}
        </form>
      </details>
    </section>
  )
}
