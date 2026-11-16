import { Link } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import { usePresencePulse } from '../../hooks/usePresencePulse.ts'
import '../support/supportDock.css'

export function WorkspaceFooter() {
  const { onlineCount } = usePresencePulse()
  const { strings } = useI18n()

  return (
    <footer className="workspace-footer">
      <div className="sf-container workspace-footer-inner">
        <div className="workspace-footer-links">
          <Link href="/static/privacy_summary">{strings.common.dataRetentionSummary}</Link>
          <Link href="/user/profile#mobile-qr">{strings.common.getMobileApp}</Link>
          <a href="mailto:support@silverfour.edu">support@silverfour.edu</a>
        </div>

        {onlineCount !== null ? (
          <span className="sf-text-muted tabular-nums" aria-label="Active workspace learners">
            {onlineCount} {strings.common.onlineLabel}
          </span>
        ) : null}
      </div>
    </footer>
  )
}
