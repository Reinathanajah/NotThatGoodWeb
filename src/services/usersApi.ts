import type { AuthUserProfile, UpdateProfileInput } from '../types/auth.ts'
import { apiFetch } from './apiClient.ts'

export function fetchMyProfile(signal?: AbortSignal): Promise<AuthUserProfile> {
  return apiFetch<AuthUserProfile>('/users/me/profile', { signal })
}

export function updateMyProfile(input: UpdateProfileInput): Promise<AuthUserProfile> {
  return apiFetch<AuthUserProfile>('/users/me/profile', {
    method: 'PATCH',
    body: input,
  })
}
