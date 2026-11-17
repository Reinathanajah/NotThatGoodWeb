export type FileLicense = 'all_rights_reserved' | 'cc_by' | 'cc_by_sa' | 'public_domain'

export interface StoredFileMetaDto {
  id: string
  originalName: string
  displayName: string
  mimeType: string
  sizeBytes: number
  authorName: string | null
  license: FileLicense
  uploadedAt: string
  sha256?: string | null
  downloadUrl: string
}

export interface PrivateFileEntryDto {
  id: string
  parentFolderId: string | null
  isFolder: boolean
  name: string
  createdAt: string
  updatedAt: string
  file: StoredFileMetaDto | null
}

export interface PrivateFilesListingDto {
  view: 'grid' | 'list' | 'tree'
  quota: {
    quotaBytes: number
    usedBytes: number
    remainingBytes: number
    maxUploadFileBytes: number
  }
  currentFolder: { id: string; name: string; parentFolderId: string | null } | null
  breadcrumbs: Array<{ id: string; name: string }>
  entries: PrivateFileEntryDto[]
}

export interface WikimediaResultDto {
  title: string
  url: string
  mimeType: string
  license: FileLicense
  author: string
}

export interface FilePickerSourcesDto {
  source: 'all' | 'recent' | 'private' | 'wikimedia'
  repositories: Array<{ id: string; label: string; writable: boolean }>
  uploadDefaults: {
    author: string
    defaultLicense: FileLicense
    licenses: Array<{ code: FileLicense; label: string }>
  }
  recentFiles: StoredFileMetaDto[]
  privateFiles: PrivateFileEntryDto[]
  wikimediaResults: WikimediaResultDto[]
}

export interface UploadFileInput {
  file: Blob
  filename: string
  saveAs?: string
  author?: string
  license: FileLicense
  target: 'private' | 'submission_draft'
  parentFolderId?: string
}

export interface UploadFileResultDto {
  file: StoredFileMetaDto
  privateEntry: PrivateFileEntryDto | null
  quota: {
    quotaBytes: number
    usedBytes: number
    remainingBytes: number
  }
}
