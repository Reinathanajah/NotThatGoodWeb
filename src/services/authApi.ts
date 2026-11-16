import type {
  AuthUserProfile,
  BrowserSessionDto,
  ForgotPasswordResult,
  LoginResult,
  MobileQrTokenDto,
} from '../types/auth.ts'
import { apiFetch } from './apiClient.ts'

export function loginWithCredentials(identifier: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>('/auth/login', {
    method: 'POST',
    body: { identifier, password },
    skipAuth: true,
    skipUnauthorizedEvent: true,
  })
}

export function logoutCurrentSession(): Promise<{ loggedOut: boolean }> {
  return apiFetch<{ loggedOut: boolean }>('/auth/logout', {
    method: 'POST',
    skipUnauthorizedEvent: true,
  })
}

export function fetchCurrentUser(signal?: AbortSignal): Promise<AuthUserProfile> {
  return apiFetch<AuthUserProfile>('/auth/me', { signal })
}

export function listBrowserSessions(signal?: AbortSignal): Promise<BrowserSessionDto[]> {
  return apiFetch<BrowserSessionDto[]>('/auth/sessions', { signal })
}

export function revokeBrowserSession(
  sessionId: string,
): Promise<{ id: string; revokedAt: string }> {
  return apiFetch<{ id: string; revokedAt: string }>(`/auth/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}

export function requestPasswordResetEmail(identifier: string): Promise<ForgotPasswordResult> {
  return apiFetch<ForgotPasswordResult>('/auth/forgot-password', {
    method: 'POST',
    body: { identifier },
    skipAuth: true,
  })
}

export function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ reset: boolean }> {
  return apiFetch<{ reset: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword },
    skipAuth: true,
  })
}

export function createMobileQrCode(): Promise<MobileQrTokenDto> {
  return apiFetch<MobileQrTokenDto>('/auth/mobile-qr', { method: 'POST' })
}

export function exchangeMobileQrToken(qrToken: string): Promise<LoginResult> {
  return apiFetch<LoginResult>('/auth/mobile-qr/exchange', {
    method: 'POST',
    body: { qrToken },
    skipAuth: true,
    skipUnauthorizedEvent: true,
  })
}
