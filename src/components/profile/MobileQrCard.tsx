import { QrCode, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buildDeterministicQrMatrix } from '../../lib/qrMatrixSvg.ts'
import { createMobileQrCode, exchangeMobileQrToken } from '../../services/authApi.ts'
import type { MobileQrTokenDto } from '../../types/auth.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

export function MobileQrCard() {
  const [qr, setQr] = useState<MobileQrTokenDto | null>(null)
  const [generating, setGenerating] = useState(false)
  const [exchanging, setExchanging] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [verifiedNote, setVerifiedNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!qr) return
    const timer = window.setInterval(() => {
      const rem = Math.max(0, Math.floor((new Date(qr.expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(rem)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [qr])

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setVerifiedNote(null)
    try {
      const created = await createMobileQrCode()
      setSecondsLeft(Math.max(0, Math.floor((new Date(created.expiresAt).getTime() - Date.now()) / 1000)))
      setQr(created)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to generate mobile QR code')
    } finally {
      setGenerating(false)
    }
  }

  async function handleVerifyExchange() {
    if (!qr) return
    setExchanging(true)
    setError(null)
    try {
      const res = await exchangeMobileQrToken(qr.qrToken)
      setVerifiedNote(`Mobile session paired cleanly (ID ${res.sessionId.slice(0, 8)}).`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Token exchange failed')
    } finally {
      setExchanging(false)
    }
  }

  const matrix = qr ? buildDeterministicQrMatrix(qr.qrUri) : null

  return (
    <section id="mobile-qr" className="sf-surface res-stage-card sf-stack" aria-labelledby="mobile-qr-heading">
      <h2 id="mobile-qr-heading" className="sf-heading-section sf-row">
        <Smartphone size={20} color="var(--accent)" aria-hidden="true" />
        <span>Mobile app QR pairing</span>
      </h2>
      <p className="sf-text-muted">
        Generate a single-use 10-minute QR credential to pair the SilverFour companion app.
      </p>

      {error ? <StatusBanner variant="error" title="QR pairing error" message={error} /> : null}
      {verifiedNote ? <StatusBanner variant="success" title="Token exchanged" message={verifiedNote} /> : null}

      <button type="button" className="sf-btn sf-btn--primary" disabled={generating} onClick={() => void handleGenerate()}>
        <QrCode size={16} aria-hidden="true" />
        <span>{generating ? 'Generating QR...' : qr ? 'Regenerate QR code' : 'Generate mobile QR'}</span>
      </button>

      {qr && matrix ? (
        <div className="sf-stack" style={{ alignItems: 'flex-start' }}>
          <div className="qr-frame">
            <svg
              width={180}
              height={180}
              viewBox={`0 0 ${matrix.size} ${matrix.size}`}
              role="img"
              aria-label={`SilverFour pairing QR matrix for token ${qr.qrToken.slice(0, 8)}`}
            >
              <rect x={0} y={0} width={matrix.size} height={matrix.size} fill="#FFFFFF" />
              {matrix.modules.map((row, r) =>
                row.map((filled, c) =>
                  filled ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0E1015" /> : null,
                ),
              )}
            </svg>
          </div>
          <p className="sf-text-muted tabular-nums">
            Expires in {Math.floor(secondsLeft / 60)}m {secondsLeft % 60}s
          </p>
          <code className="pf-checksum">{qr.qrToken}</code>
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            disabled={exchanging || secondsLeft === 0 || Boolean(verifiedNote)}
            onClick={() => void handleVerifyExchange()}
          >
            {exchanging ? 'Exchanging...' : verifiedNote ? 'Already exchanged' : 'Test QR exchange'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
