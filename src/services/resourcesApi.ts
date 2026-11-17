import type { ResourceDetailDto } from '../types/courses.ts'
import { apiFetch } from './apiClient.ts'
import { apiDownloadBlob, type DownloadedBlobResult } from './apiBinary.ts'

export function fetchResourceDetail(
  moduleId: number,
  signal?: AbortSignal,
): Promise<ResourceDetailDto> {
  return apiFetch<ResourceDetailDto>(`/resources/${moduleId}`, { signal })
}

export function fetchResourceBinary(
  moduleId: number,
  disposition: 'inline' | 'attachment',
  fallbackFilename: string,
  signal?: AbortSignal,
): Promise<DownloadedBlobResult> {
  return apiDownloadBlob(`/resources/${moduleId}/download?disposition=${disposition}`, {
    fallbackFilename,
    signal,
  })
}

export function saveBlobToDisk(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
