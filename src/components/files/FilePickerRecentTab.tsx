import { FileText } from 'lucide-react'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { StoredFileMetaDto } from '../../types/files.ts'

interface FilePickerRecentTabProps {
  files: StoredFileMetaDto[]
  timeZone: string
  onSelectFile: (file: StoredFileMetaDto) => void
}

export function FilePickerRecentTab({
  files,
  timeZone,
  onSelectFile,
}: FilePickerRecentTabProps) {
  if (files.length === 0) {
    return <p className="sf-text-muted">No recently uploaded files available yet.</p>
  }

  return (
    <ul className="assign-file-list">
      {files.map((file) => (
        <li key={file.id}>
          <button
            type="button"
            className="fp-item-btn"
            onClick={() => onSelectFile(file)}
          >
            <span className="sf-row" style={{ gap: 'var(--space-2)' }}>
              <FileText size={17} color="var(--accent)" aria-hidden="true" />
              <strong>{file.displayName}</strong>
            </span>
            <span className="sf-text-muted tabular-nums">
              {formatBytes(file.sizeBytes)} · {formatDateTimeShort(file.uploadedAt, timeZone)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
