import { ChevronRight, FileText, Folder } from 'lucide-react'
import { useState } from 'react'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { PrivateFileEntryDto, StoredFileMetaDto } from '../../types/files.ts'

interface FilePickerPrivateTabProps {
  entries: PrivateFileEntryDto[]
  timeZone: string
  onSelectFile: (file: StoredFileMetaDto) => void
}

function buildFolderTrail(entries: PrivateFileEntryDto[], folderId: string | null) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  const trail: PrivateFileEntryDto[] = []
  let cursorId = folderId
  let guard = 0
  while (cursorId && guard < 20) {
    const folder = byId.get(cursorId)
    if (!folder) break
    trail.unshift(folder)
    cursorId = folder.parentFolderId
    guard += 1
  }
  return trail
}

export function FilePickerPrivateTab({
  entries,
  timeZone,
  onSelectFile,
}: FilePickerPrivateTabProps) {
  const [folderId, setFolderId] = useState<string | null>(null)
  const trail = buildFolderTrail(entries, folderId)
  const visible = entries.filter((entry) => entry.parentFolderId === folderId)

  return (
    <div className="sf-stack" style={{ gap: 'var(--space-3)' }}>
      <nav aria-label="Private folder path" className="sf-row" style={{ gap: 'var(--space-1)' }}>
        <button type="button" className="sf-btn sf-btn--ghost" onClick={() => setFolderId(null)}>
          Private files
        </button>
        {trail.map((crumb) => (
          <span key={crumb.id} className="sf-row" style={{ gap: 'var(--space-1)' }}>
            <ChevronRight size={15} aria-hidden="true" />
            <button
              type="button"
              className="sf-btn sf-btn--ghost"
              onClick={() => setFolderId(crumb.id)}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="sf-text-muted">No files or subfolders stored in this folder yet.</p>
      ) : (
        <ul className="assign-file-list">
          {visible.map((entry) =>
            entry.isFolder ? (
              <li key={entry.id}>
                <button
                  type="button"
                  className="fp-item-btn"
                  onClick={() => setFolderId(entry.id)}
                >
                  <span className="sf-row" style={{ gap: 'var(--space-2)' }}>
                    <Folder size={17} color="var(--accent)" aria-hidden="true" />
                    <strong>{entry.name}</strong>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </li>
            ) : entry.file ? (
              <li key={entry.id}>
                <button
                  type="button"
                  className="fp-item-btn"
                  onClick={() => onSelectFile(entry.file!)}
                >
                  <span className="sf-row" style={{ gap: 'var(--space-2)' }}>
                    <FileText size={17} color="var(--accent)" aria-hidden="true" />
                    <strong>{entry.file.displayName}</strong>
                  </span>
                  <span className="sf-text-muted tabular-nums">
                    {formatBytes(entry.file.sizeBytes)} · {formatDateTimeShort(entry.file.uploadedAt, timeZone)}
                  </span>
                </button>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  )
}
