import { Trash2 } from 'lucide-react'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { StagedAttachment } from './SubmissionFilesDropzone.tsx'

interface StagedFileListProps {
  files: StagedAttachment[]
  disabled: boolean
  onRemoveFile: (fileId: string) => void
}

export function StagedFileList({ files, disabled, onRemoveFile }: StagedFileListProps) {
  if (files.length === 0) return null
  return (
    <ul className="assign-file-list">
      {files.map((file) => (
        <li key={file.id} className="assign-file-row">
          <div className="sf-stack" style={{ gap: '2px' }}>
            <strong>{file.name}</strong>
            <span className="sf-text-muted tabular-nums">
              {formatBytes(file.sizeBytes)} · {file.license}
            </span>
          </div>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
            onClick={() => onRemoveFile(file.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>Remove</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
