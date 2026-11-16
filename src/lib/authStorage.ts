const ACCESS_TOKEN_KEY = 'silverfour_access_token'

type UnauthorizedListener = () => void
const unauthorizedListeners = new Set<UnauthorizedListener>()

export function getStoredAccessToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredAccessToken(token: string): void {
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // Ignore storage failures when cookies/storage are disabled.
  }
}

export function clearStoredAccessToken(): void {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // Ignore storage cleanup failures cleanly.
  }
}

export function subscribeUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

export function notifyUnauthorized(): void {
  for (const listener of unauthorizedListeners) {
    listener()
  }
}
