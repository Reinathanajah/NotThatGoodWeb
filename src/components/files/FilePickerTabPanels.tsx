import type { FilePickerSourcesDto, StoredFileMetaDto } from '../../types/files.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { FilePickerPrivateTab } from './FilePickerPrivateTab.tsx'
import { FilePickerRecentTab } from './FilePickerRecentTab.tsx'
import { FilePickerUploadTab } from './FilePickerUploadTab.tsx'
import { FilePickerWikimediaTab } from './FilePickerWikimediaTab.tsx'

export type PickerTab = 'recent' | 'upload' | 'private' | 'wikimedia'

interface FilePickerTabPanelsProps {
  activeTab: PickerTab
  data: FilePickerSourcesDto | null
  loading: boolean
  error: string | null
  timeZone: string
  uploadTarget: 'private' | 'submission_draft'
  parentFolderId?: string
  maxFileSizeBytes?: number
  wikiQuery: string
  onWikiQueryChange: (q: string) => void
  onRetry: () => void
  onSelect: (file: StoredFileMetaDto) => void
}

export function FilePickerTabPanels({
  activeTab,
  data,
  loading,
  error,
  timeZone,
  uploadTarget,
  parentFolderId,
  maxFileSizeBytes,
  wikiQuery,
  onWikiQueryChange,
  onRetry,
  onSelect,
}: FilePickerTabPanelsProps) {
  if (error) {
    return (
      <StatusBanner
        variant="error"
        title="Could not load repositories"
        message={error}
        actionLabel="Retry"
        onAction={onRetry}
      />
    )
  }
  if (!data && loading) {
    return <StatusBanner variant="loading" title="Loading repositories" skeletonLines={4} />
  }
  if (!data) return null

  if (activeTab === 'recent') {
    return <FilePickerRecentTab files={data.recentFiles} timeZone={timeZone} onSelectFile={onSelect} />
  }
  if (activeTab === 'upload') {
    return (
      <FilePickerUploadTab
        uploadTarget={uploadTarget}
        parentFolderId={parentFolderId}
        maxFileSizeBytes={maxFileSizeBytes}
        defaultAuthor={data.uploadDefaults.author}
        defaultLicense={data.uploadDefaults.defaultLicense}
        licenses={data.uploadDefaults.licenses}
        onUploaded={onSelect}
      />
    )
  }
  if (activeTab === 'private') {
    return (
      <FilePickerPrivateTab
        entries={data.privateFiles}
        timeZone={timeZone}
        onSelectFile={onSelect}
      />
    )
  }
  return (
    <FilePickerWikimediaTab
      results={data.wikimediaResults}
      query={wikiQuery}
      onQueryChange={onWikiQueryChange}
      uploadTarget={uploadTarget}
      parentFolderId={parentFolderId}
      onAttached={onSelect}
    />
  )
}
