import { Download, X } from 'lucide-react'
import { useRef } from 'react'
import { useAuth } from '../../context/authContextValue.ts'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { PrivateFileEntryDto } from '../../types/files.ts'

interface FileMetadataDrawerProps {
  entry: PrivateFileEntryDto | null
  downloading: boolean
  onDownload: (fileId: string, name: string) => void
  onClose: () => void
}

export function FileMetadataDrawer({
  entry,
  downloading,
  onDownload,
  onClose,
}: FileMetadataDrawerProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const panelRef = useRef<HTMLDivElement>(null)
  const file = entry?.file ?? null

  useFocusTrap(Boolean(entry && file), panelRef, onClose)

  if (!entry || !file) return null

  return (
    <div
      className="pf-drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className="pf-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-drawer-title"
        tabIndex={-1}
      >
        <div className="fp-header" style={{ paddingInline: 0 }}>
          <h2 id="pf-drawer-title" className="sf-heading-section" style={{ overflowWrap: 'anywhere' }}>
            {file.displayName}
          </h2>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            aria-label="Close file details"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <dl className="foundation-meta tabular-nums">
          <div className="foundation-meta-row">
            <dt>Original filename</dt>
            <dd>{file.originalName}</dd>
          </div>
          <div className="foundation-meta-row">
            <dt>Size</dt>
            <dd>{formatBytes(file.sizeBytes)}</dd>
          </div>
          <div className="foundation-meta-row">
            <dt>MIME type</dt>
            <dd>{file.mimeType}</dd>
          </div>
          <div className="foundation-meta-row">
            <dt>Author</dt>
            <dd>{file.authorName || 'Not specified'}</dd>
          </div>
          <div className="foundation-meta-row">
            <dt>License</dt>
            <dd>{file.license}</dd>
          </div>
          <div className="foundation-meta-row">
            <dt>Uploaded</dt>
            <dd>{formatDateTimeShort(file.uploadedAt, tz)}</dd>
          </div>
          <div className="foundation-meta-row">
            <dt>SHA-256 checksum</dt>
            <dd className="pf-checksum">{file.sha256 || 'Not recorded for seeded fixture'}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="sf-btn sf-btn--primary"
          disabled={downloading}
          onClick={() => onDownload(file.id, file.originalName)}
        >
          <Download size={16} aria-hidden="true" />
          <span>{downloading ? 'Downloading...' : 'Download file'}</span>
        </button>
      </div>
    </div>
  )
}
