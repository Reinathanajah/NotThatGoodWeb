import { Link } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

interface WorkspacePreviewPageProps {
  title: string
}

// TODO: Replace this placeholder once dedicated feature pages ship for upcoming modules.
export function WorkspacePreviewPage({ title }: WorkspacePreviewPageProps) {
  useDocumentTitle(title)

  return (
    <AppShell>
      <section className="sf-surface foundation-card sf-stack" aria-labelledby="preview-title">
        <h1 id="preview-title" className="sf-heading-display">
          {title}
        </h1>
        <StatusBanner
          variant="info"
          title="Coming soon"
          message={`${title} is not available in this workspace yet. Check back in an upcoming release or return to your dashboard.`}
        />
        <div className="sf-row">
          <Link href="/" className="sf-btn sf-btn--primary">
            Return to dashboard
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
