import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { applyTheme, getInitialTheme, type ThemeMode } from '../../lib/theme.ts'

interface ThemeSwitchProps {
  compact?: boolean
}

export function ThemeSwitch({ compact = false }: ThemeSwitchProps) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  const handleToggle = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="sf-btn sf-btn--secondary motion-surface"
      onClick={handleToggle}
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'Switch to light paper theme' : 'Switch to dark horizon theme'}
      style={compact ? { paddingInline: '10px', minWidth: 'var(--tap-min)' } : undefined}
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      {!compact ? <span>{theme === 'dark' ? 'Light paper' : 'Dark horizon'}</span> : null}
    </button>
  )
}
