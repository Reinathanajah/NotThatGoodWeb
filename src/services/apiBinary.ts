import { notifyUnauthorized } from '../lib/authStorage.ts'
import type { ApiEnvelope } from '../types/api.ts'
import {
  ApiClientError,
  buildApiUrl,
  createAuthHeaders,
  decodeErrorEnvelope,
} from './apiClient.ts'

export interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export interface DownloadedBlobResult {
  blob: Blob
  filename: string
  mimeType: string
}

function extractFilenameFromHeader(disposition: string | null, fallback = 'download'): string {
  if (!disposition) return fallback
  const match = /filename="?([^";\r\n]+)"?/i.exec(disposition)
  return match?.[1] ?? fallback
}

export function apiUploadMultipart<T>(
  path: string,
  formData: FormData,
  options: UploadOptions = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', buildApiUrl(path), true)

    const authHeaders = createAuthHeaders(false)
    for (const [key, value] of Object.entries(authHeaders)) {
      xhr.setRequestHeader(key, value)
    }

    const abortHandler = () => xhr.abort()
    options.signal?.addEventListener('abort', abortHandler, { once: true })

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
      }
    }

    xhr.onerror = () => reject(new ApiClientError(0, 'NETWORK_ERROR', 'Network upload failed'))
    xhr.onabort = () => reject(new ApiClientError(0, 'ABORTED', 'Upload was aborted'))

    xhr.onload = () => {
      options.signal?.removeEventListener('abort', abortHandler)
      if (xhr.status === 401) notifyUnauthorized()

      let parsed: unknown = null
      try {
        parsed = JSON.parse(xhr.responseText)
      } catch {
        parsed = null
      }

      const envelope = parsed as ApiEnvelope<T> | null
      if (xhr.status >= 200 && xhr.status < 300 && envelope?.ok && envelope.data !== undefined) {
        resolve(envelope.data)
        return
      }
      reject(decodeErrorEnvelope(xhr.status, parsed))
    }

    xhr.send(formData)
  })
}

/** Fetch binary downloads with JWT headers so authenticated files and resources do not 401. */
export async function apiDownloadBlob(
  path: string,
  options: { signal?: AbortSignal; fallbackFilename?: string } = {},
): Promise<DownloadedBlobResult> {
  const response = await fetch(buildApiUrl(path), {
    method: 'GET',
    signal: options.signal,
    headers: { ...createAuthHeaders(false) },
  })

  if (response.status === 401) notifyUnauthorized()

  if (!response.ok) {
    let parsed: unknown = null
    try {
      parsed = await response.json()
    } catch {
      parsed = null
    }
    throw decodeErrorEnvelope(response.status, parsed)
  }

  const blob = await response.blob()
  const mimeType = response.headers.get('Content-Type') || blob.type || 'application/octet-stream'
  const filename = extractFilenameFromHeader(
    response.headers.get('Content-Disposition'),
    options.fallbackFilename,
  )

  return { blob, filename, mimeType }
}
