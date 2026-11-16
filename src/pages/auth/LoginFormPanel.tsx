import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { StatusBanner } from '../../components/ui/StatusBanner.tsx'
import { ApiClientError } from '../../services/apiClient.ts'
import type { I18nStringsMap } from '../../types/i18n.ts'

interface LoginFormPanelProps {
  labels: I18nStringsMap['auth']
  onSubmitCredentials: (identifier: string, password: string) => Promise<unknown>
  onSwitchToRecovery: () => void
}

export function LoginFormPanel({
  labels,
  onSubmitCredentials,
  onSwitchToRecovery,
}: LoginFormPanelProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setFieldErrors({})

    try {
      await onSubmitCredentials(identifier, password)
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message)
        setFieldErrors({
          identifier: error.getFieldError('identifier'),
          password: error.getFieldError('password'),
        })
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sf-stack">
      <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        <h1 className="sf-heading-display">{labels.loginTitle}</h1>
        <p className="sf-text-muted">Sign in with your account username or email.</p>
      </div>

      {errorMessage ? (
        <StatusBanner variant="error" title="Sign in failed" message={errorMessage} />
      ) : null}

      <form className="sf-stack" onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div className="foundation-field">
          <label htmlFor="login-identifier">{labels.usernamePlaceholder}</label>
          <input
            id="login-identifier"
            type="text"
            autoComplete="username"
            placeholder="student.demo"
            value={identifier}
            aria-invalid={Boolean(fieldErrors.identifier)}
            aria-describedby={fieldErrors.identifier ? 'login-identifier-error' : undefined}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {fieldErrors.identifier ? (
            <p id="login-identifier-error" className="foundation-field-error">
              {fieldErrors.identifier}
            </p>
          ) : null}
        </div>

        <div className="foundation-field">
          <label htmlFor="login-password">{labels.passwordPlaceholder}</label>
          <div className="login-password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login-pw-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="login-password-error" className="foundation-field-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="sf-row" style={{ justifyContent: 'space-between' }}>
          <button
            type="submit"
            className="sf-btn sf-btn--primary motion-surface"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : labels.loginButton}
          </button>

          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            onClick={onSwitchToRecovery}
          >
            {labels.lostPassword}
          </button>
        </div>
      </form>
    </div>
  )
}
