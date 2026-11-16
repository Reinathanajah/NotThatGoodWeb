export type ThemeMode = 'dark' | 'light'

const THEME_STORAGE_KEY = 'silverfour_theme'

export function getStoredTheme(): ThemeMode | null {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

export function getInitialTheme(): ThemeMode {
  const stored = getStoredTheme()
  if (stored) return stored

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return 'dark'
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  root.dataset.theme = mode

  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', mode === 'dark' ? '#0E1015' : '#F8F7F4')
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // Ignore storage restrictions in private browsing windows.
  }
}

export function initTheme(): ThemeMode {
  const initial = getInitialTheme()
  applyTheme(initial)
  return initial
}
