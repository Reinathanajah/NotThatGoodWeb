import { ChevronRight, FolderPlus, FolderTree, LayoutGrid, List, Upload } from 'lucide-react'
import { useState } from 'react'
import type { PrivateViewMode } from '../../hooks/usePrivateFiles.ts'
import type { PrivateFilesListingDto } from '../../types/files.ts'
import { NewFolderInlineForm } from './NewFolderInlineForm.tsx'
import { StorageQuotaGauge } from './StorageQuotaGauge.tsx'

interface QuotaAndToolbarCardProps {
  listing: PrivateFilesListingDto
  view: PrivateViewMode
  creatingFolder: boolean
  folderError: string | null
  onChangeView: (view: PrivateViewMode) => void
  onOpenFolder: (folderId: string | null) => void
  onCreateFolder: (name: string) => Promise<boolean>
  onClearFolderError: () => void
  onOpenUploadPicker: () => void
}

const VIEW_MODES = [
  { id: 'list', label: 'List', Icon: List },
  { id: 'grid', label: 'Grid', Icon: LayoutGrid },
  { id: 'tree', label: 'Tree', Icon: FolderTree },
] as const

export function QuotaAndToolbarCard({
  listing,
  view,
  creatingFolder,
  folderError,
  onChangeView,
  onOpenFolder,
  onCreateFolder,
  onClearFolderError,
  onOpenUploadPicker,
}: QuotaAndToolbarCardProps) {
  const [showFolderForm, setShowFolderForm] = useState(false)
  const { quota } = listing

  return (
    <header className="sf-surface cat-header-card sf-stack" aria-labelledby="private-files-heading">
      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 280px' }}>
          <h1 id="private-files-heading" className="sf-heading-display">
            Private files
          </h1>
          <p className="sf-text-muted">
            Store coursework drafts, notes, and personal materials within your 2 GB SilverFour vault.
          </p>
        </div>

        <div className="sf-row">
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            aria-expanded={showFolderForm}
            onClick={() => {
              onClearFolderError()
              setShowFolderForm((prev) => !prev)
            }}
          >
            <FolderPlus size={16} aria-hidden="true" />
            <span>New folder</span>
          </button>
          <button type="button" className="sf-btn sf-btn--primary" onClick={onOpenUploadPicker}>
            <Upload size={16} aria-hidden="true" />
            <span>Upload with details</span>
          </button>
        </div>
      </div>

      <StorageQuotaGauge
        usedBytes={quota.usedBytes}
        quotaBytes={quota.quotaBytes}
        remainingBytes={quota.remainingBytes}
      />

      {showFolderForm ? (
        <NewFolderInlineForm
          creatingFolder={creatingFolder}
          folderError={folderError}
          onCreateFolder={onCreateFolder}
          onClearFolderError={onClearFolderError}
          onDone={() => setShowFolderForm(false)}
        />
      ) : null}

      <div className="dash-controls">
        <nav aria-label="Folder breadcrumbs" className="sf-row" style={{ gap: 'var(--space-1)' }}>
          <button type="button" className="sf-btn sf-btn--ghost" onClick={() => onOpenFolder(null)}>
            Private files
          </button>
          {listing.breadcrumbs.map((crumb) => (
            <span key={crumb.id} className="sf-row" style={{ gap: 'var(--space-1)' }}>
              <ChevronRight size={15} aria-hidden="true" />
              <button
                type="button"
                className="sf-btn sf-btn--ghost"
                onClick={() => onOpenFolder(crumb.id)}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>

        <div className="pf-view-group" role="group" aria-label="View layout">
          {VIEW_MODES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className="sf-btn sf-btn--secondary pf-view-btn"
              aria-pressed={view === id}
              onClick={() => onChangeView(id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
