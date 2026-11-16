import { createContext, useContext } from 'react'
import { DEFAULT_EN_STRINGS, DEFAULT_LANGUAGE_OPTIONS } from '../lib/i18nDefaults.ts'
import type { SupportedLang } from '../types/auth.ts'
import type { I18nStringsMap, LanguageOptionDto } from '../types/i18n.ts'

export interface I18nContextValue {
  lang: SupportedLang
  strings: I18nStringsMap
  availableLanguages: LanguageOptionDto[]
  switching: boolean
  changeLanguage: (nextLang: SupportedLang) => Promise<void>
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  strings: DEFAULT_EN_STRINGS,
  availableLanguages: DEFAULT_LANGUAGE_OPTIONS,
  switching: false,
  changeLanguage: async () => {},
})

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
