import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/files/filePicker.css'
import '../components/files/privateFiles.css'
import { Upload } from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import { DeleteFileModal } from '../components/files/DeleteFileModal.tsx'
import { FileMetadataDrawer } from '../components/files/FileMetadataDrawer.tsx'
import { FilePickerModal } from '../components/files/FilePickerModal.tsx'
import { PrivateEntriesView } from '../components/files/PrivateEntriesView.tsx'
import { QuotaAndToolbarCard } from '../components/files/QuotaAndToolbarCard.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { usePrivateFiles } from '../hooks/usePrivateFiles.ts'
import { formatBytes } from '../lib/formatBytes.ts'

export function PrivateFilesPage() {
  useDocumentTitle('Private files')
  const pf = usePrivateFiles()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    void pf.actions.uploadFiles(e.dataTransfer.files)
  }

  return (
    <AppShell>
      {pf.error ? (
        <StatusBanner
          variant="error"
          title="Could not load private files"
          message={pf.error}
          actionLabel="Retry"
          onAction={pf.retry}
        />
      ) : pf.loading || !pf.listing ? (
        <StatusBanner variant="loading" title="Loading private files vault" skeletonLines={5} />
      ) : (
        <>
          <QuotaAndToolbarCard
            listing={pf.listing}
            view={pf.view}
            creatingFolder={pf.actions.creatingFolder}
            folderError={pf.actions.folderError}
            onChangeView={pf.setView}
            onOpenFolder={pf.openFolder}
            onCreateFolder={pf.actions.createFolder}
            onClearFolderError={() => pf.actions.setFolderError(null)}
            onOpenUploadPicker={() => setPickerOpen(true)}
          />

          {pf.actions.actionError ? (
            <StatusBanner variant="error" title="File operation failed" message={pf.actions.actionError} />
          ) : null}

          <section className="sf-surface res-stage-card" aria-label="Quick file upload">
            <div
              className={`fp-dropzone${dragOver ? ' fp-dropzone--active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <p className="sf-text-muted tabular-nums">
                Drag files here to upload directly into{' '}
                <strong>{pf.listing.currentFolder?.name ?? 'Private files'}</strong> (Max{' '}
                {formatBytes(pf.listing.quota.maxUploadFileBytes)} per file).
              </p>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                disabled={pf.actions.uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} aria-hidden="true" />
                <span>{pf.actions.uploading ? 'Uploading...' : 'Select files'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                disabled={pf.actions.uploading}
                onChange={(e) => {
                  void pf.actions.uploadFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
          </section>

          <PrivateEntriesView
            entries={pf.listing.entries}
            view={pf.view}
            downloadingId={pf.actions.downloadingId}
            onOpenFolder={pf.openFolder}
            onInspect={pf.inspectEntry}
            onDownload={(id, name) => void pf.actions.downloadFile(id, name)}
            onDelete={pf.requestDelete}
          />

          <FileMetadataDrawer
            entry={pf.inspectedEntry}
            downloading={pf.actions.downloadingId === pf.inspectedEntry?.file?.id}
            onDownload={(id, name) => void pf.actions.downloadFile(id, name)}
            onClose={pf.closeInspect}
          />

          <DeleteFileModal
            entry={pf.deleteTarget}
            deleting={pf.actions.deleting}
            conflictMessage={pf.actions.deleteConflict}
            onConfirmDelete={(unlinkOnly) => void pf.confirmDelete(unlinkOnly)}
            onClose={pf.closeDelete}
          />

          <FilePickerModal
            open={pickerOpen}
            uploadTarget="private"
            parentFolderId={pf.folderId ?? undefined}
            maxFileSizeBytes={pf.listing.quota.maxUploadFileBytes}
            onSelect={pf.refresh}
            onClose={() => setPickerOpen(false)}
          />
        </>
      )}
    </AppShell>
  )
}
