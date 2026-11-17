import { formatBytes } from '../../lib/formatBytes.ts'
import type { ResourceDetailDto } from '../../types/courses.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { ResourceUrlPanel } from './ResourceUrlPanel.tsx'

interface ResourcePreviewStageProps {
  detail: ResourceDetailDto
  previewLoading: boolean
  previewError: string | null
  previewUrl: string | null
  htmlContent: string | null
  downloading: boolean
  onDownload: () => void
  onRetry: () => void
}

export function ResourcePreviewStage({
  detail,
  previewLoading,
  previewError,
  previewUrl,
  htmlContent,
  downloading,
  onDownload,
  onRetry,
}: ResourcePreviewStageProps) {
  if (detail.resourceKind === 'url') {
    return <ResourceUrlPanel detail={detail} />
  }

  const file = detail.file
  if (!file) {
    return (
      <StatusBanner
        variant="empty"
        title="No file attached"
        message="This resource does not currently include a downloadable file attachment."
      />
    )
  }

  if (previewError) {
    return (
      <StatusBanner
        variant="error"
        title="Preview unavailable"
        message={previewError}
        actionLabel="Retry preview"
        onAction={onRetry}
      />
    )
  }

  if (previewLoading) {
    return <StatusBanner variant="loading" title="Loading inline file preview" skeletonLines={5} />
  }

  if (htmlContent !== null) {
    return (
      <section className="sf-surface res-stage-card sf-stack" aria-label="Interactive HTML simulation">
        <div className="dash-controls">
          <span className="sf-text-muted">
            Sandboxed HTML simulation ({file.originalName} · {formatBytes(file.sizeBytes)})
          </span>
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            disabled={downloading}
            onClick={onDownload}
          >
            {downloading ? 'Downloading...' : 'Download HTML'}
          </button>
        </div>
        <iframe
          sandbox="allow-scripts"
          srcDoc={htmlContent}
          title={detail.title}
          className="res-preview-frame"
        />
      </section>
    )
  }

  if (previewUrl && file.mimeType.includes('pdf')) {
    return (
      <section className="sf-surface res-stage-card sf-stack" aria-label="PDF document preview">
        <div className="dash-controls">
          <span className="sf-text-muted">
            PDF viewer ({file.originalName} · {formatBytes(file.sizeBytes)})
          </span>
          <a href={previewUrl} target="_blank" rel="noreferrer noopener" className="sf-btn sf-btn--secondary">
            Open in new tab
          </a>
        </div>
        <iframe src={previewUrl} title={detail.title} className="res-preview-frame" />
      </section>
    )
  }

  if (previewUrl && file.mimeType.startsWith('image/')) {
    return (
      <section className="sf-surface res-stage-card" aria-label="Image preview">
        <img src={previewUrl} alt={detail.title} width={800} height={520} className="res-preview-image" />
      </section>
    )
  }

  if (previewUrl && file.mimeType.startsWith('video/')) {
    return (
      <section className="sf-surface res-stage-card" aria-label="Video player">
        <video src={previewUrl} controls className="res-preview-image" style={{ width: '100%' }}>
          Your browser does not support video playback.
        </video>
      </section>
    )
  }

  if (previewUrl && file.mimeType.startsWith('audio/')) {
    return (
      <section className="sf-surface res-stage-card" aria-label="Audio player">
        <audio src={previewUrl} controls style={{ width: '100%' }}>
          Your browser does not support audio playback.
        </audio>
      </section>
    )
  }

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-label="File download panel">
      <p className="sf-text-muted">
        Inline browser preview is not supported for {file.mimeType} ({formatBytes(file.sizeBytes)}).
      </p>
      <div>
        <button type="button" className="sf-btn sf-btn--primary" disabled={downloading} onClick={onDownload}>
          {downloading ? 'Downloading...' : `Download ${file.originalName}`}
        </button>
      </div>
    </section>
  )
}
