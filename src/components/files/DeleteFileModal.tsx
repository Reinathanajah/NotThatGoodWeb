import { AlertTriangle, X } from 'lucide-react'
import { useRef } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import type { PrivateFileEntryDto } from '../../types/files.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface DeleteFileModalProps {
  entry: PrivateFileEntryDto | null
  deleting: boolean
  conflictMessage: string | null
  onConfirmDelete: (unlinkOnly: boolean) => void
  onClose: () => void
}

export function DeleteFileModal({
  entry,
  deleting,
  conflictMessage,
  onConfirmDelete,
  onClose,
}: DeleteFileModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(Boolean(entry), dialogRef, onClose)

  if (!entry) return null

  return (
    <div
      className="fp-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="fp-dialog"
        style={{ width: 'min(520px, 100%)', maxHeight: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-delete-title"
        tabIndex={-1}
      >
        <div className="fp-header">
          <h2 id="pf-delete-title" className="sf-heading-section sf-row">
            <AlertTriangle size={20} color="var(--status-error)" aria-hidden="true" />
            <span>Delete {entry.isFolder ? 'folder' : 'file'}</span>
          </h2>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            aria-label="Cancel deletion"
            disabled={deleting}
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="fp-panel sf-stack">
          <p>
            Remove <strong>{entry.name}</strong>
            {entry.isFolder
              ? ' and all nested entries inside it? Files still attached to submitted coursework will remain preserved.'
              : ' permanently from your account?'}
          </p>

          {conflictMessage ? (
            <StatusBanner
              variant="error"
              title="Referenced by active coursework (409 Conflict)"
              message={`${conflictMessage}. You can unlink it from Private Files without deleting the submitted attachment.`}
            />
          ) : null}

          <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="sf-btn sf-btn--ghost"
              disabled={deleting}
              onClick={onClose}
            >
              Cancel
            </button>
            {conflictMessage && !entry.isFolder ? (
              <button
                type="button"
                className="sf-btn sf-btn--primary"
                disabled={deleting}
                onClick={() => onConfirmDelete(true)}
              >
                {deleting ? 'Removing...' : 'Unlink from Private Files'}
              </button>
            ) : (
              <button
                type="button"
                className="sf-btn sf-btn--primary"
                disabled={deleting}
                onClick={() => onConfirmDelete(false)}
              >
                {deleting ? 'Deleting...' : 'Confirm delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
