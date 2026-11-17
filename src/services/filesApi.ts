import type {
  FilePickerSourcesDto,
  UploadFileInput,
  UploadFileResultDto,
} from '../types/files.ts'
import { apiUploadMultipart, type UploadOptions } from './apiBinary.ts'
import { apiFetch } from './apiClient.ts'

export function fetchFilePickerSources(
  source: 'all' | 'recent' | 'private' | 'wikimedia' = 'all',
  query?: string,
  signal?: AbortSignal,
): Promise<FilePickerSourcesDto> {
  const params = new URLSearchParams({ source })
  if (query?.trim()) params.set('q', query.trim())
  return apiFetch<FilePickerSourcesDto>(`/file-picker/sources?${params.toString()}`, { signal })
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
