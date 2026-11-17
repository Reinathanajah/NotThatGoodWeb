import { Upload } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { formatBytes } from '../../lib/formatBytes.ts'
import { uploadFileMultipart } from '../../services/filesApi.ts'
import type { FileLicense, StoredFileMetaDto } from '../../types/files.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface FilePickerUploadTabProps {
  uploadTarget: 'private' | 'submission_draft'
  parentFolderId?: string
  maxFileSizeBytes?: number
  defaultAuthor: string
  defaultLicense: FileLicense
  licenses: Array<{ code: FileLicense; label: string }>
  onUploaded: (file: StoredFileMetaDto) => void
}

export function FilePickerUploadTab({
  uploadTarget,
  parentFolderId,
  maxFileSizeBytes,
  defaultAuthor,
  defaultLicense,
  licenses,
  onUploaded,
}: FilePickerUploadTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saveAs, setSaveAs] = useState('')
  const [author, setAuthor] = useState(defaultAuthor)
  const [license, setLicense] = useState<FileLicense>(defaultLicense)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(file: File | null) {
    setError(null)
    if (!file) {
      setSelectedFile(null)
      return
    }
    if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
      setSelectedFile(null)
      setError(`Selected file exceeds the ${formatBytes(maxFileSizeBytes)} limit for this assignment.`)
      return
    }
    setSelectedFile(file)
    if (!saveAs.trim()) setSaveAs(file.name)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedFile) {
      setError('Select a file to upload first.')
      return
    }
    setError(null)
    setProgress(0)
    try {
      const res = await uploadFileMultipart(
        {
          file: selectedFile,
          filename: selectedFile.name,
          saveAs: saveAs.trim() || selectedFile.name,
          author: author.trim() || defaultAuthor,
          license,
          target: uploadTarget,
          parentFolderId,
        },
        { onProgress: setProgress },
      )
      onUploaded(res.file)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'File upload failed')
      setProgress(null)
    }
  }

  return (
    <form className="sf-stack" onSubmit={handleSubmit}>
      {error ? <StatusBanner variant="error" title="Upload issue" message={error} /> : null}

      <div className="foundation-field">
        <label htmlFor="fp-upload-input">Choose file</label>
        <input
          id="fp-upload-input"
          type="file"
          disabled={progress !== null}
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {maxFileSizeBytes ? (
          <span className="sf-text-muted tabular-nums">
            Maximum file size: {formatBytes(maxFileSizeBytes)}
          </span>
        ) : null}
      </div>

      <div className="foundation-field">
        <label htmlFor="fp-save-as">Save as</label>
        <input
          id="fp-save-as"
          type="text"
          maxLength={255}
          value={saveAs}
          disabled={progress !== null}
          onChange={(e) => setSaveAs(e.target.value)}
        />
      </div>

      <div className="foundation-field">
        <label htmlFor="fp-author">Author</label>
        <input
          id="fp-author"
          type="text"
          maxLength={200}
          value={author}
          disabled={progress !== null}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="foundation-field">
        <label htmlFor="fp-license">License</label>
        <select
          id="fp-license"
          className="dash-select"
          value={license}
          disabled={progress !== null}
          onChange={(e) => setLicense(e.target.value as FileLicense)}
        >
          {licenses.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {progress !== null ? (
        <div className="sf-stack" style={{ gap: '4px' }}>
          <span className="sf-text-muted tabular-nums">Uploading... {progress}%</span>
          <div
            className="assign-meter-track"
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="assign-meter-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="sf-btn sf-btn--primary" disabled={progress !== null || !selectedFile}>
          <Upload size={16} aria-hidden="true" />
          <span>{progress !== null ? 'Uploading...' : 'Upload this file'}</span>
        </button>
      </div>
    </form>
  )
}
