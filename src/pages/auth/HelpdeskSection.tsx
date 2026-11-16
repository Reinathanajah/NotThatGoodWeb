import { ExternalLink, HelpCircle } from 'lucide-react'
import type { SupportStatusDto } from '../../types/workspace.ts'

interface HelpdeskSectionProps {
  support: SupportStatusDto | null
}

export function HelpdeskSection({ support }: HelpdeskSectionProps) {
  const email = support?.helpdesk.email ?? 'support@silverfour.edu'
  const locationUrl = support?.helpdesk.locationUrl ?? 'https://helpdesk.silverfour.edu/'
  const guideUrl = support?.helpdesk.guideUrl ?? 'https://guides.silverfour.edu/'

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
          <a href={locationUrl} target="_blank" rel="noreferrer noopener" className="sf-row">
            <span>Helpdesk portal</span>
            <ExternalLink size={15} aria-hidden="true" />
          </a>
          <a href={guideUrl} target="_blank" rel="noreferrer noopener" className="sf-row">
            <span>Platform user guides</span>
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </details>
  )
}
