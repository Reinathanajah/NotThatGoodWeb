import { getStoredAccessToken, notifyUnauthorized } from '../lib/authStorage.ts'
import { clientEnv } from '../lib/env.ts'
import type { ApiEnvelope, ApiErrorDetail, ApiResult } from '../types/api.ts'

export class ApiClientError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }

  getFieldError(fieldName: string): string | null {
    const match = this.details.find(
      (item) => item.field === fieldName || item.field === `body.${fieldName}`,
    )
    return match?.message ?? null
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  skipAuth?: boolean
  skipUnauthorizedEvent?: boolean
  headers?: Record<string, string>
}

export function buildApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${clientEnv.apiBaseUrl}${normalized}`
}

export function createAuthHeaders(skipAuth?: boolean): Record<string, string> {
  if (skipAuth) return {}
  const token = getStoredAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function decodeErrorEnvelope(status: number, parsed: unknown): ApiClientError {
  if (parsed && typeof parsed === 'object' && 'error' in parsed) {
    const body = (parsed as ApiEnvelope<unknown>).error
    if (body) {
      return new ApiClientError(
        status,
        body.code || `HTTP_${status}`,
        body.message || `Request failed with HTTP ${status}`,
        body.details ?? [],
      )
    }
  }
  return new ApiClientError(status, `HTTP_${status}`, `Request failed with HTTP ${status}`)
}

export async function apiFetchWithMeta<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const response = await fetch(buildApiUrl(path), {
    method: options.method ?? 'GET',
    signal: options.signal,
    headers: {
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...createAuthHeaders(options.skipAuth),
      ...options.headers,
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  })

  let parsed: unknown = null
  try {
    parsed = await response.json()
  } catch {
    parsed = null
  }

  if (response.status === 401 && !options.skipUnauthorizedEvent) {
    notifyUnauthorized()
  }

  const envelope = parsed as ApiEnvelope<T> | null
  if (!response.ok || !envelope?.ok || envelope.data === undefined) {
    throw decodeErrorEnvelope(response.status, parsed)
  }

  return { data: envelope.data, meta: envelope.meta }
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const result = await apiFetchWithMeta<T>(path, options)
  return result.data
}
