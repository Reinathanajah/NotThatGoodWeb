import { createContext, useContext } from 'react'
import type { AuthUserProfile } from '../types/auth.ts'
import type { HealthPayloadDto } from '../types/workspace.ts'

export type AuthStatus = 'checking' | 'authenticated' | 'guest'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUserProfile | null
  token: string | null
  health: HealthPayloadDto | null
  healthStatus: 'loading' | 'ready' | 'error'
  healthError: string | null
  refreshHealth: () => Promise<void>
  login: (identifier: string, password: string) => Promise<AuthUserProfile>
  logout: () => Promise<void>
  refreshProfile: () => Promise<AuthUserProfile | null>
  setAuthenticatedSession: (accessToken: string, profile: AuthUserProfile) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
