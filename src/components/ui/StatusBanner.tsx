import './feedback.css'
import { AlertCircle, CheckCircle2, Inbox, Info, Loader2 } from 'lucide-react'

export type BannerVariant = 'loading' | 'empty' | 'error' | 'info' | 'success'

interface StatusBannerProps {
  variant: BannerVariant
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  skeletonLines?: number
}

const ICONS = {
  loading: Loader2,
  empty: Inbox,
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
} as const

export function StatusBanner({
  variant,
  title,
  message,
  actionLabel,
  onAction,
  skeletonLines = 0,
}: StatusBannerProps) {
  const Icon = ICONS[variant]
  const role = variant === 'error' ? 'alert' : 'status'

  return (
    <div className={`status-banner status-banner--${variant}`} role={role}>
      <div className="status-banner-body">
        <Icon size={20} aria-hidden="true" />
        <div className="sf-stack" style={{ gap: '0.25rem', width: '100%' }}>
          <p className="status-banner-title">{title}</p>
          {message ? <p className="status-banner-desc">{message}</p> : null}
          {variant === 'loading' && skeletonLines > 0 ? (
            <div className="skeleton-stack" aria-hidden="true">
              {Array.from({ length: skeletonLines }, (_, idx) => (
                <div
                  key={idx}
                  className="skeleton-bar"
                  style={{ width: idx === skeletonLines - 1 ? '65%' : '100%' }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {actionLabel && onAction ? (
        <button
          type="button"
          className="sf-btn sf-btn--secondary motion-surface"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
