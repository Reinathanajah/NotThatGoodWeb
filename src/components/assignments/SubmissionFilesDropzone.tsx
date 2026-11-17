import { FolderOpen, Trash2, Upload } from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { StoredFileMetaDto } from '../../types/files.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { validateAndUploadFiles } from './submissionUploadHelper.ts'

export interface StagedAttachment {
  id: string
  name: string
  sizeBytes: number
  license: string
}

interface SubmissionFilesDropzoneProps {
  files: StagedAttachment[]
  maxFiles: number
  maxFileSizeBytes: number
  disabled: boolean
  fieldError: string | null
  onAddFile: (file: StoredFileMetaDto) => void
  onRemoveFile: (fileId: string) => void
  onOpenPicker: () => void
}

export function SubmissionFilesDropzone({
  files,
  maxFiles,
  maxFileSizeBytes,
  disabled,
  fieldError,
  onAddFile,
  onRemoveFile,
  onOpenPicker,
}: SubmissionFilesDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function processIncoming(incoming: FileList | null) {
    if (!incoming || incoming.length === 0 || disabled) return
    setUploadError(null)
    setUploading(true)
    try {
      const errMsg = await validateAndUploadFiles(
        incoming,
        files.length,
        maxFiles,
        maxFileSizeBytes,
        onAddFile,
      )
      if (errMsg) setUploadError(errMsg)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    void processIncoming(e.dataTransfer.files)
  }

  return (
    <div className="sf-stack" style={{ gap: 'var(--space-3)' }}>
      <div className="dash-controls">
        <span className="sf-text-muted tabular-nums" style={{ fontWeight: 600 }}>
          File submissions ({files.length} / {maxFiles} · Max {formatBytes(maxFileSizeBytes)} each)
        </span>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          disabled={disabled || uploading || files.length >= maxFiles}
          onClick={onOpenPicker}
        >
          <FolderOpen size={16} aria-hidden="true" />
          <span>Open File Picker</span>
        </button>
      </div>

      {uploadError ? <StatusBanner variant="error" title="Attachment error" message={uploadError} /> : null}
      {fieldError ? (
        <p className="foundation-field-error" role="alert">
          ! Required: {fieldError}
        </p>
      ) : null}

      <div
        className={`fp-dropzone${dragOver ? ' fp-dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <p className="sf-text-muted">
          Drag files here to stage for your submission, or browse from your device.
        </p>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          disabled={disabled || uploading || files.length >= maxFiles}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          <span>{uploading ? 'Uploading...' : 'Select local files'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          disabled={disabled || uploading || files.length >= maxFiles}
          onChange={(e) => {
            void processIncoming(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 ? (
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
      ) : null}
    </div>
  )
}
