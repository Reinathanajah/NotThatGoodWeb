const rawApiUrl = import.meta.env.VITE_API_URL?.trim()

export const clientEnv = {
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'SilverFour',
  appEnv: import.meta.env.VITE_APP_ENV?.trim() || import.meta.env.MODE,
  // Relative path routes browser dev traffic through Vite's proxy to avoid CORS port mismatches.
  apiBaseUrl: import.meta.env.DEV ? '/api/v1' : rawApiUrl || '/api/v1',
} as const
