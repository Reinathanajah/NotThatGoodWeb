import type {
  FilePickerSourcesDto,
  PrivateFileEntryDto,
  PrivateFilesListingDto,
  UploadFileInput,
  UploadFileResultDto,
} from '../types/files.ts'
import { apiDownloadBlob, apiUploadMultipart, type UploadOptions } from './apiBinary.ts'
import { apiFetch } from './apiClient.ts'
import { saveBlobToDisk } from './resourcesApi.ts'

export function fetchFilePickerSources(
  source: 'all' | 'recent' | 'private' | 'wikimedia' = 'all',
  query?: string,
  signal?: AbortSignal,
): Promise<FilePickerSourcesDto> {
  const params = new URLSearchParams({ source })
  if (query?.trim()) params.set('q', query.trim())
  return apiFetch<FilePickerSourcesDto>(`/file-picker/sources?${params.toString()}`, { signal })
}

export function fetchPrivateFiles(
  view: 'grid' | 'list' | 'tree' = 'list',
  folderId?: string | null,
  signal?: AbortSignal,
): Promise<PrivateFilesListingDto> {
  const params = new URLSearchParams({ view })
  if (folderId) params.set('folderId', folderId)
  return apiFetch<PrivateFilesListingDto>(`/files/private?${params.toString()}`, { signal })
}

export function createPrivateFolder(
  name: string,
  parentFolderId?: string | null,
): Promise<PrivateFileEntryDto> {
  return apiFetch<PrivateFileEntryDto>('/files/private/folders', {
    method: 'POST',
    body: { name, parentFolderId: parentFolderId ?? null },
  })
}

export function deletePrivateFileOrFolder(targetId: string): Promise<{
  deletedId: string
  kind: string
  quota: { quotaBytes: number; usedBytes: number; remainingBytes: number }
}> {
  return apiFetch(`/files/${targetId}`, { method: 'DELETE' })
}

export async function downloadPrivateFile(
  fileId: string,
  fallbackName: string,
): Promise<void> {
  const { blob, filename } = await apiDownloadBlob(`/files/${fileId}/download`, {
    fallbackFilename: fallbackName,
  })
  saveBlobToDisk(blob, filename)
}

export function uploadFileMultipart(
  input: UploadFileInput,
  options: UploadOptions = {},
): Promise<UploadFileResultDto> {
  const form = new FormData()
  form.append('file', input.file, input.filename)
  if (input.saveAs?.trim()) form.append('saveAs', input.saveAs.trim())
  if (input.author?.trim()) form.append('author', input.author.trim())
  form.append('license', input.license)
  form.append('target', input.target)
  if (input.parentFolderId) form.append('parentFolderId', input.parentFolderId)

  return apiUploadMultipart<UploadFileResultDto>('/files/upload', form, options)
}
