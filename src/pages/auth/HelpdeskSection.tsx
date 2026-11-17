import { ExternalLink, HelpCircle } from 'lucide-react'
import { Link } from 'wouter'
import { resolveGuideTarget } from '../../lib/guideHref.ts'
import type { SupportStatusDto } from '../../types/workspace.ts'

interface HelpdeskSectionProps {
  support: SupportStatusDto | null
}

export function HelpdeskSection({ support }: HelpdeskSectionProps) {
  const email = support?.helpdesk.email ?? 'support@silverfour.edu'
  const locationTarget = resolveGuideTarget(support?.helpdesk.locationUrl ?? '/static/platform_guides#helpdesk', true)
  const guideTarget = resolveGuideTarget(support?.helpdesk.guideUrl ?? '/static/platform_guides', true)

  return (
    <details className="login-disclosure">
      <summary>
        <HelpCircle size={18} aria-hidden="true" />
        <span>Is this your first time here? Helpdesk & guides</span>
      </summary>
      <div className="login-disclosure-body">
        <p>
          For account or sign-in issues, contact{' '}
          <a href={`mailto:${email}`}>{email}</a> or visit{' '}
          {support?.helpdesk.name ?? 'SilverFour Helpdesk'}.
        </p>
        <div className="sf-row">
          {locationTarget.isExternal ? (
            <a href={locationTarget.href} target="_blank" rel="noreferrer noopener" className="sf-row">
              <span>Helpdesk portal</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link href={locationTarget.href} className="sf-row">
              <span>Helpdesk portal</span>
            </Link>
          )}
          {guideTarget.isExternal ? (
            <a href={guideTarget.href} target="_blank" rel="noreferrer noopener" className="sf-row">
              <span>Platform user guides</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link href={guideTarget.href} className="sf-row">
              <span>Platform user guides</span>
            </Link>
          )}
        </div>
      </div>
    </details>
  )
}
