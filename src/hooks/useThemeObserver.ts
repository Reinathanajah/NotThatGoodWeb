import { useEffect, useState } from 'react'
import { getInitialTheme, type ThemeMode } from '../lib/theme.ts'

function readCurrentTheme(): ThemeMode {
  const attr = document.documentElement.dataset.theme
  return attr === 'light' || attr === 'dark' ? attr : getInitialTheme()
}

export function useThemeObserver(): ThemeMode {
  const [theme, setTheme] = useState<ThemeMode>(readCurrentTheme)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(readCurrentTheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}
