import '../components/categories/categories.css'
import '../components/courses/courseDetail.css'
import '../components/resources/resources.css'
import { ChevronRight } from 'lucide-react'
import { Link, useLocation, useParams } from 'wouter'
import { ActivityNavigationRail } from '../components/courses/ActivityNavigationRail.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { ResourcePreviewStage } from '../components/resources/ResourcePreviewStage.tsx'
import { SafeHtmlBlock } from '../components/ui/SafeHtmlBlock.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAuth } from '../context/authContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useResourceViewer } from '../hooks/useResourceViewer.ts'
import { resolveCourseHref } from '../lib/appRoutes.ts'
import { formatDateTimeShort } from '../lib/dateFormat.ts'
import { formatBytes } from '../lib/formatBytes.ts'

export function ResourceViewerPage() {
  const params = useParams<{ moduleId?: string }>()
  const [, setLocation] = useLocation()
  const { user } = useAuth()
  const parsedId = Number(params.moduleId)
  const moduleId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0

  const viewer = useResourceViewer(moduleId)
  const detail = viewer.detail
  const tz = user?.timezone ?? 'UTC'
  useDocumentTitle(detail ? detail.title : 'Resource viewer')

  return (
    <AppShell>
      {moduleId === 0 ? (
        <StatusBanner
          variant="error"
          title="Invalid resource identifier"
          message="Open a course from your dashboard or directory to access course materials."
          actionLabel="Return to dashboard"
          onAction={() => setLocation('/')}
        />
      ) : viewer.error ? (
        <StatusBanner
          variant="error"
          title="Could not load resource"
          message={viewer.error}
          actionLabel="Retry resource"
          onAction={viewer.retry}
        />
      ) : viewer.loading || !detail ? (
        <StatusBanner variant="loading" title="Loading course resource" skeletonLines={5} />
      ) : (
        <>
          {viewer.actionError ? (
            <StatusBanner variant="error" title="Action failed" message={viewer.actionError} />
          ) : null}

          <header className="sf-surface cat-header-card sf-stack" aria-labelledby="resource-title">
            <nav aria-label="Resource breadcrumb">
              <ol className="cat-breadcrumb-list">
                <li className="cat-breadcrumb-item">
                  <Link href={resolveCourseHref(detail.course)}>
                    {detail.course.code} · {detail.course.title}
                  </Link>
                  <ChevronRight size={16} aria-hidden="true" />
                </li>
                {detail.section ? (
                  <li className="cat-breadcrumb-item">
                    <span>{detail.section.title}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </li>
                ) : null}
                <li className="cat-breadcrumb-item">
                  <span aria-current="page" style={{ fontWeight: 600 }}>
                    {detail.title}
                  </span>
                </li>
              </ol>
            </nav>

            <div className="dash-controls">
              <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 320px' }}>
                <h1 id="resource-title" className="sf-heading-display">
                  {detail.title}
                </h1>
                <p className="sf-text-muted tabular-nums">
                  {detail.subsectionLabel ? `${detail.subsectionLabel} · ` : ''}
                  {detail.resourceKind.toUpperCase()}
                  {detail.file
                    ? ` · ${formatBytes(detail.file.sizeBytes)} · Uploaded ${formatDateTimeShort(detail.file.uploadedAt, tz)}`
                    : ''}
                </p>
                {detail.file?.authorName ? (
                  <p className="sf-text-muted">
                    Author: {detail.file.authorName} ({detail.file.license})
                  </p>
                ) : null}
              </div>

              <div className="sf-row">
                <label
                  className={`course-complete-check${detail.isCompleted ? ' course-complete-check--done' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={detail.isCompleted}
                    disabled={viewer.togglingComplete}
                    aria-label={detail.isCompleted ? 'Mark resource incomplete' : 'Mark resource done'}
                    onChange={(e) => void viewer.toggleCompletion(e.target.checked)}
                  />
                  <span>{detail.isCompleted ? 'Done' : 'Mark done'}</span>
                </label>

                {detail.file ? (
                  <button
                    type="button"
                    className="sf-btn sf-btn--primary"
                    disabled={viewer.downloading}
                    onClick={() => void viewer.downloadAttachment()}
                  >
                    {viewer.downloading ? 'Downloading...' : 'Download file'}
                  </button>
                ) : null}
              </div>
            </div>

            {detail.descriptionHtml ? <SafeHtmlBlock html={detail.descriptionHtml} /> : null}
          </header>

          <ResourcePreviewStage
            detail={detail}
            previewLoading={viewer.previewLoading}
            previewError={viewer.previewError}
            previewUrl={viewer.previewUrl}
            htmlContent={viewer.htmlContent}
            downloading={viewer.downloading}
            onDownload={() => void viewer.downloadAttachment()}
            onRetry={viewer.retry}
          />

          <ActivityNavigationRail course={detail.course} navigation={detail.navigation} />
        </>
      )}
    </AppShell>
  )
}
