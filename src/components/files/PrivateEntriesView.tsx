import { Download, FileText, Folder, Info, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/authContextValue.ts'
import type { PrivateViewMode } from '../../hooks/usePrivateFiles.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { PrivateFileEntryDto } from '../../types/files.ts'
import { flattenPrivateTree } from './privateTreeHelper.ts'

interface PrivateEntriesViewProps {
  entries: PrivateFileEntryDto[]
  view: PrivateViewMode
  downloadingId: string | null
  onOpenFolder: (folderId: string) => void
  onInspect: (entry: PrivateFileEntryDto) => void
  onDownload: (fileId: string, name: string) => void
  onDelete: (entry: PrivateFileEntryDto) => void
}

export function PrivateEntriesView({
  entries,
  view,
  downloadingId,
  onOpenFolder,
  onInspect,
  onDownload,
  onDelete,
}: PrivateEntriesViewProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'

  if (entries.length === 0) {
    return (
      <section className="sf-surface res-stage-card">
        <p className="sf-text-muted">
          This folder is empty. Drag files into the upload zone above or create a new folder.
        </p>
      </section>
    )
  }

  const rows =
    view === 'tree'
      ? flattenPrivateTree(entries)
      : entries.map((entry) => ({ entry, depth: 0 }))

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-label="Stored private files">
      <ul className={view === 'grid' ? 'pf-grid' : 'assign-file-list'}>
        {rows.map(({ entry, depth }) => {
          const isFolder = entry.isFolder
          const file = entry.file
          const rowClass =
            view === 'grid'
              ? 'pf-grid-card'
              : `pf-list-row${view === 'tree' ? ' pf-tree-node' : ''}`
          const rowStyle =
            view === 'tree' ? ({ '--tree-depth': depth } as React.CSSProperties) : undefined

          return (
            <li key={entry.id} className={rowClass} style={rowStyle}>
              <div className="sf-stack" style={{ gap: '2px', flex: '1 1 220px' }}>
                {isFolder ? (
                  <button
                    type="button"
                    className="pf-entry-title"
                    onClick={() => onOpenFolder(entry.id)}
                  >
                    <Folder size={18} color="var(--accent)" aria-hidden="true" />
                    <span>{entry.name}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pf-entry-title"
                    onClick={() => onInspect(entry)}
                  >
                    <FileText size={18} color="var(--accent)" aria-hidden="true" />
                    <span>{entry.name}</span>
                  </button>
                )}

                <span className="sf-text-muted tabular-nums">
                  {isFolder
                    ? `Folder · Updated ${formatDateTimeShort(entry.updatedAt, tz)}`
                    : file
                      ? `${formatBytes(file.sizeBytes)} · ${file.mimeType} · ${formatDateTimeShort(file.uploadedAt, tz)}`
                      : 'File entry'}
                </span>
              </div>

              <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
                {file ? (
                  <>
                    <button
                      type="button"
                      className="sf-btn sf-btn--ghost"
                      aria-label={`Details for ${entry.name}`}
                      onClick={() => onInspect(entry)}
                    >
                      <Info size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="sf-btn sf-btn--secondary"
                      disabled={downloadingId === file.id}
                      onClick={() => onDownload(file.id, file.originalName)}
                    >
                      <Download size={16} aria-hidden="true" />
                      <span>{downloadingId === file.id ? 'Downloading...' : 'Download'}</span>
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  className="sf-btn sf-btn--ghost"
                  aria-label={`Delete ${entry.name}`}
                  onClick={() => onDelete(entry)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
