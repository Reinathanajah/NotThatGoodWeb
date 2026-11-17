import { Download } from 'lucide-react'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { AssignmentFileDto } from '../../types/activities.ts'

interface AssignmentFilesListProps {
  files: AssignmentFileDto[]
  timeZone: string
  downloadingFileId: string | null
  onDownloadFile: (fileId: string, fileName: string) => void
}

export function AssignmentFilesList({
  files,
  timeZone,
  downloadingFileId,
  onDownloadFile,
}: AssignmentFilesListProps) {
  if (files.length === 0) {
    return <span className="sf-text-muted">No files attached to this submission yet.</span>
  }

  return (
    <ul className="assign-file-list">
      {files.map((file) => (
        <li key={file.id} className="assign-file-row">
          <div className="sf-stack" style={{ gap: '2px' }}>
            <strong>{file.displayName}</strong>
            <span className="sf-text-muted">
              {formatBytes(file.sizeBytes)} · Uploaded {formatDateTimeShort(file.uploadedAt, timeZone)}
            </span>
          </div>
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            disabled={downloadingFileId === file.id}
            onClick={() => onDownloadFile(file.id, file.originalName)}
          >
            <Download size={16} aria-hidden="true" />
            <span>{downloadingFileId === file.id ? 'Downloading...' : 'Download'}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
