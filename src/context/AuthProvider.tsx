import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
  subscribeUnauthorized,
} from '../lib/authStorage.ts'
import {
  fetchCurrentUser,
  loginWithCredentials,
  logoutCurrentSession,
} from '../services/authApi.ts'
import { fetchApiHealth } from '../services/systemApi.ts'
import type { AuthUserProfile } from '../types/auth.ts'
import type { HealthPayloadDto } from '../types/workspace.ts'
import { AuthContext, type AuthStatus } from './authContextValue.ts'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredAccessToken())
  const [status, setStatus] = useState<AuthStatus>(() =>
    getStoredAccessToken() ? 'checking' : 'guest',
  )
  const [user, setUser] = useState<AuthUserProfile | null>(null)
  const [health, setHealth] = useState<HealthPayloadDto | null>(null)
  const [healthStatus, setHealthStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [healthError, setHealthError] = useState<string | null>(null)

  useEffect(() => {
    return subscribeUnauthorized(() => {
      clearStoredAccessToken()
      setToken(null)
      setUser(null)
      setStatus('guest')
    })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchApiHealth(controller.signal).then(
      (payload) => {
        setHealth(payload)
        setHealthStatus('ready')
        setHealthError(null)
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        setHealthStatus('error')
        setHealthError(error instanceof Error ? error.message : 'API connectivity error')
      },
    )
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    fetchCurrentUser(controller.signal).then(
      (profile) => {
        setUser(profile)
        setStatus('authenticated')
      },
      () => {
        if (controller.signal.aborted) return
        clearStoredAccessToken()
        setToken(null)
        setUser(null)
        setStatus('guest')
      },
    )
    return () => controller.abort()
  }, [token])

  const refreshHealth = useCallback(async () => {
    setHealthStatus('loading')
    setHealthError(null)
    try {
      const payload = await fetchApiHealth()
      setHealth(payload)
      setHealthStatus('ready')
    } catch (error: unknown) {
      setHealthStatus('error')
      setHealthError(error instanceof Error ? error.message : 'API connectivity error')
    }
  }, [])

  const setAuthenticatedSession = useCallback(
    (accessToken: string, profile: AuthUserProfile) => {
      setStoredAccessToken(accessToken)
      setToken(accessToken)
      setUser(profile)
      setStatus('authenticated')
    },
    [],
  )

  const login = useCallback(
    async (identifier: string, password: string): Promise<AuthUserProfile> => {
      const result = await loginWithCredentials(identifier, password)
      setAuthenticatedSession(result.accessToken, result.user)
      return result.user
    },
    [setAuthenticatedSession],
  )

  const logout = useCallback(async () => {
    try {
      if (getStoredAccessToken()) {
        await logoutCurrentSession()
      }
    } finally {
      clearStoredAccessToken()
      setToken(null)
      setUser(null)
      setStatus('guest')
    }
  }, [])

  const refreshProfile = useCallback(async (): Promise<AuthUserProfile | null> => {
    if (!getStoredAccessToken()) return null
    const profile = await fetchCurrentUser()
    setUser(profile)
    setStatus('authenticated')
    return profile
  }, [])

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        token,
        health,
        healthStatus,
        healthError,
        refreshHealth,
        login,
        logout,
        refreshProfile,
        setAuthenticatedSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
