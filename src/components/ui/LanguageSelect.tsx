import { useI18n } from '../../context/i18nContextValue.ts'
import type { SupportedLang } from '../../types/auth.ts'

interface LanguageSelectProps {
  id: string
  showLabel?: boolean
  className?: string
}

export function LanguageSelect({
  id,
  showLabel = false,
  className = 'sf-lang-select',
}: LanguageSelectProps) {
  const { lang, availableLanguages, strings, switching, changeLanguage } = useI18n()

  return (
    <>
      <label
        htmlFor={id}
        className={showLabel ? 'sf-text-muted' : 'sr-only'}
        style={showLabel ? { fontWeight: 600 } : undefined}
      >
        {strings.profile.languageSelector}
      </label>
      <select
        id={id}
        className={className}
        value={lang}
        disabled={switching}
        onChange={(e) => void changeLanguage(e.target.value as SupportedLang)}
      >
        {availableLanguages.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  )
}
