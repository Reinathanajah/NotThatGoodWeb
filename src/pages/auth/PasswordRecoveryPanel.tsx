import { KeyRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { StatusBanner } from '../../components/ui/StatusBanner.tsx'
import { ApiClientError } from '../../services/apiClient.ts'
import { confirmPasswordReset, requestPasswordResetEmail } from '../../services/authApi.ts'

interface PasswordRecoveryPanelProps {
  onBackToLogin: () => void
}

function formatRecoveryError(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError) {
    return err.details.length > 0 ? err.details.map((d) => d.message).join('; ') : err.message
  }
  return err instanceof Error ? err.message : fallback
}

export function PasswordRecoveryPanel({ onBackToLogin }: PasswordRecoveryPanelProps) {
  const [identifier, setIdentifier] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'request' | 'confirm' | 'done'>('request')
  const [submitting, setSubmitting] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [devToken, setDevToken] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await requestPasswordResetEmail(identifier)
      setInfoMessage(res.message)
      setDevToken(res.devResetToken ?? null)
      if (res.devResetToken) setToken(res.devResetToken)
      setStep('confirm')
    } catch (err: unknown) {
      setErrorMessage(formatRecoveryError(err, 'Unable to request reset'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await confirmPasswordReset(token, newPassword)
      setStep('done')
    } catch (err: unknown) {
      setErrorMessage(formatRecoveryError(err, 'Unable to reset password'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sf-stack">
      <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        <h1 className="sf-heading-display">Reset password</h1>
        <p className="sf-text-muted">Request a single-use recovery token for your SilverFour account.</p>
      </div>

      {errorMessage ? <StatusBanner variant="error" title="Recovery error" message={errorMessage} /> : null}
      {infoMessage && step === 'confirm' ? (
        <StatusBanner
          variant="info"
          title="Reset token issued"
          message={devToken ? `${infoMessage} Development token applied below.` : infoMessage}
        />
      ) : null}

      {step === 'done' ? (
        <StatusBanner
          variant="success"
          title="Password updated"
          message="Your previous sessions have been closed. Sign in with your new password."
          actionLabel="Back to sign in"
          onAction={onBackToLogin}
        />
      ) : step === 'request' ? (
        <form className="sf-stack" onSubmit={(e) => void handleRequest(e)} noValidate>
          <div className="foundation-field">
            <label htmlFor="recover-id">Username or email</label>
            <input
              id="recover-id"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <button type="submit" className="sf-btn sf-btn--primary" disabled={submitting}>
            <KeyRound size={18} aria-hidden="true" />
            <span>{submitting ? 'Sending...' : 'Request reset token'}</span>
          </button>
        </form>
      ) : (
        <form className="sf-stack" onSubmit={(e) => void handleConfirm(e)} noValidate>
          <div className="foundation-field">
            <label htmlFor="recover-token">Reset token</label>
            <input
              id="recover-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="foundation-field">
            <label htmlFor="recover-pw">New password (min 8 characters)</label>
            <input
              id="recover-pw"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="sf-btn sf-btn--primary" disabled={submitting}>
            <span>{submitting ? 'Updating...' : 'Confirm new password'}</span>
          </button>
        </form>
      )}

      <button type="button" className="sf-btn sf-btn--ghost" onClick={onBackToLogin}>
        Back to sign in
      </button>
    </div>
  )
}
