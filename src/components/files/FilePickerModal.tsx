import '../assignments/assignments.css'
import './filePicker.css'
import { Clock, FileText, Folder, Globe, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAuth } from '../../context/authContextValue.ts'
import { useFilePickerSources } from '../../hooks/useFilePickerSources.ts'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import type { StoredFileMetaDto } from '../../types/files.ts'
import { FilePickerTabPanels, type PickerTab } from './FilePickerTabPanels.tsx'

interface FilePickerModalProps {
  open: boolean
  uploadTarget?: 'private' | 'submission_draft'
  parentFolderId?: string
  maxFileSizeBytes?: number
  onSelect: (file: StoredFileMetaDto) => void
  onClose: () => void
}

const TAB_ICONS = {
  recent: Clock,
  upload: Upload,
  private: Folder,
  wikimedia: Globe,
} as const

const FALLBACK_REPOS = [
  { id: 'recent', label: 'Recent files' },
  { id: 'upload', label: 'Upload a file' },
  { id: 'private', label: 'Private files' },
  { id: 'wikimedia', label: 'Wikimedia' },
]

export function FilePickerModal({
  open,
  uploadTarget = 'submission_draft',
  parentFolderId,
  maxFileSizeBytes,
  onSelect,
  onClose,
}: FilePickerModalProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const dialogRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<PickerTab>('upload')
  const [wikiQuery, setWikiQuery] = useState('')
  const sources = useFilePickerSources(open, wikiQuery)

  useFocusTrap(open, dialogRef, onClose)

  if (!open) return null

  const pickAndClose = (file: StoredFileMetaDto) => {
    onSelect(file)
    onClose()
  }

  return (
    <div
      className="fp-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="fp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fp-modal-title"
        tabIndex={-1}
      >
        <div className="fp-header">
          <h2 id="fp-modal-title" className="sf-heading-section">
            File picker
          </h2>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            aria-label="Close file picker"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="fp-body">
          <nav className="fp-nav" role="tablist" aria-label="File repositories">
            {(sources.data?.repositories ?? FALLBACK_REPOS).map((repo) => {
              const Icon = TAB_ICONS[repo.id as PickerTab] ?? FileText
              const tabId = repo.id as PickerTab
              return (
                <button
                  key={repo.id}
                  type="button"
                  role="tab"
                  className="fp-tab"
                  aria-selected={activeTab === tabId}
                  onClick={() => setActiveTab(tabId)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{repo.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="fp-panel" role="tabpanel">
            <FilePickerTabPanels
              activeTab={activeTab}
              data={sources.data}
              loading={sources.loading}
              error={sources.error}
              timeZone={tz}
              uploadTarget={uploadTarget}
              parentFolderId={parentFolderId}
              maxFileSizeBytes={maxFileSizeBytes}
              wikiQuery={wikiQuery}
              onWikiQueryChange={setWikiQuery}
              onRetry={sources.refresh}
              onSelect={pickAndClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
