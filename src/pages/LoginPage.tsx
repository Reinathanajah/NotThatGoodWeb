import './auth/login.css'
import { useEffect, useRef, useState } from 'react'
import { Redirect, useSearch } from 'wouter'
import { HorizonStage3D } from '../components/horizon3d/HorizonStage3D.tsx'
import { LanguageSelect } from '../components/ui/LanguageSelect.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { ThemeSwitch } from '../components/ui/ThemeSwitch.tsx'
import { useAuth } from '../context/authContextValue.ts'
import { useI18n } from '../context/i18nContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { fetchSupportStatus } from '../services/systemApi.ts'
import type { SupportStatusDto } from '../types/workspace.ts'
import { CookiesModal } from './auth/CookiesModal.tsx'
import { HelpdeskSection } from './auth/HelpdeskSection.tsx'
import { LoginFormPanel } from './auth/LoginFormPanel.tsx'
import { PasswordRecoveryPanel } from './auth/PasswordRecoveryPanel.tsx'

export function LoginPage() {
  useDocumentTitle('Sign in')
  const { status, login, healthStatus, healthError, refreshHealth } = useAuth()
  const { strings } = useI18n()
  const search = useSearch()
  const cookiesTriggerRef = useRef<HTMLButtonElement | null>(null)
  const [mode, setMode] = useState<'login' | 'recovery'>('login')
  const [support, setSupport] = useState<SupportStatusDto | null>(null)
  const [cookiesOpen, setCookiesOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchSupportStatus(controller.signal).then(setSupport, () => {})
    return () => controller.abort()
  }, [])

  const params = new URLSearchParams(search)
  const rawRedirect = params.get('redirect') || '/'
  const safeRedirect =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/'

  if (status === 'authenticated') {
    return <Redirect to={safeRedirect} replace />
  }

  return (
    <div className="login-layout">
      <section className="login-panel" aria-label="SilverFour sign in studio">
        <div className="sf-stack" style={{ gap: 'var(--space-5)' }}>
          <header className="login-topbar">
            <div className="sf-row">
              <img src="/favicon.svg" alt="" width={24} height={24} aria-hidden="true" />
              <strong>SilverFour</strong>
            </div>
            <div className="sf-row">
              <LanguageSelect id="guest-lang" className="login-lang-select" />
              <ThemeSwitch />
            </div>
          </header>

          {healthStatus === 'error' ? (
            <StatusBanner
              variant="error"
              title="API connection interrupted"
              message={healthError ?? undefined}
              actionLabel="Retry API"
              onAction={() => void refreshHealth()}
            />
          ) : null}

          <main id="main-content" tabIndex={-1} className="sf-stack">
            {mode === 'login' ? (
              <LoginFormPanel
                labels={strings.auth}
                onSubmitCredentials={login}
                onSwitchToRecovery={() => setMode('recovery')}
              />
            ) : (
              <PasswordRecoveryPanel onBackToLogin={() => setMode('login')} />
            )}
            <HelpdeskSection support={support} />
          </main>
        </div>

        <footer className="login-footer">
          <button
            ref={cookiesTriggerRef}
            type="button"
            className="sf-btn sf-btn--ghost"
            onClick={() => setCookiesOpen(true)}
          >
            {strings.auth.cookiesNotice}
          </button>

          <p
            className="sf-text-muted"
            title={support?.liveChat.offlineMessage ?? 'Support desk status'}
          >
            Support: {support?.liveChat.statusLabel ?? 'Offline'}
          </p>
        </footer>
      </section>

      <aside className="login-stage-pane" aria-label="Campus 3D Horizon">
        <HorizonStage3D />
      </aside>

      <CookiesModal
        open={cookiesOpen}
        titleFallback={strings.auth.cookiesNotice}
        onClose={() => {
          setCookiesOpen(false)
          cookiesTriggerRef.current?.focus()
        }}
      />
    </div>
  )
}
