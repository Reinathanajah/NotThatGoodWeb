import { Check, Globe } from 'lucide-react'
import { Link } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import { ACCOUNT_WORKSPACE_LINKS } from './navLinks.ts'

interface UserAccountMenuProps {
  fullName: string
  username: string
  onNavigate: () => void
  onLogout: () => Promise<void>
}

export function UserAccountMenu({
  fullName,
  username,
  onNavigate,
  onLogout,
}: UserAccountMenuProps) {
  const { lang, strings, availableLanguages, switching, changeLanguage } = useI18n()

  return (
    <div
      className="sf-popover-panel sf-popover-panel--right sf-stack"
      role="menu"
      aria-label="Account menu"
      style={{ gap: 'var(--space-1)', minWidth: '260px' }}
    >
      <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
        <p style={{ fontWeight: 700 }}>{fullName}</p>
        <p className="sf-text-muted">{username}</p>
      </div>

      {ACCOUNT_WORKSPACE_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="sf-popover-item"
          role="menuitem"
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      ))}

      <hr className="sf-divider" />

      <div className="sf-stack" style={{ gap: '2px', paddingTop: 'var(--space-1)' }}>
        <p
          className="sf-row sf-text-muted"
          style={{ paddingInline: 'var(--space-3)', fontWeight: 700, gap: '6px' }}
        >
          <Globe size={15} aria-hidden="true" />
          <span>{strings.profile.languageSelector}</span>
        </p>
        {availableLanguages.map((option) => {
          const isCurrent = option.code === lang
          return (
            <button
              key={option.code}
              type="button"
              role="menuitemradio"
              aria-checked={isCurrent}
              disabled={switching}
              className="sf-btn sf-btn--ghost"
              style={{ justifyContent: 'space-between', paddingInline: 'var(--space-3)' }}
              onClick={() => void changeLanguage(option.code)}
            >
              <span>{option.label}</span>
              {isCurrent ? <Check size={16} color="var(--accent)" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>

      <hr className="sf-divider" />

      <button
        type="button"
        className="sf-btn sf-btn--ghost"
        style={{ justifyContent: 'flex-start' }}
        onClick={() => {
          onNavigate()
          void onLogout()
        }}
      >
        Log out
      </button>
    </div>
  )
}
