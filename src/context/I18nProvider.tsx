import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_EN_STRINGS, DEFAULT_LANGUAGE_OPTIONS } from '../lib/i18nDefaults.ts'
import { fetchI18nStrings } from '../services/systemApi.ts'
import { updateMyProfile } from '../services/usersApi.ts'
import type { SupportedLang } from '../types/auth.ts'
import type { I18nStringsMap, LanguageOptionDto } from '../types/i18n.ts'
import { useAuth } from './authContextValue.ts'
import { I18nContext } from './i18nContextValue.ts'

interface I18nProviderProps {
  children: ReactNode
}

function syncHtmlLang(lang: SupportedLang): void {
  document.documentElement.lang = lang === 'zh_cn' ? 'zh-CN' : lang
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { user, status, refreshProfile } = useAuth()
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('en')
  const [strings, setStrings] = useState<I18nStringsMap>(DEFAULT_EN_STRINGS)
  const [availableLanguages, setAvailableLanguages] =
    useState<LanguageOptionDto[]>(DEFAULT_LANGUAGE_OPTIONS)
  const [switching, setSwitching] = useState(false)

  const activeLang = status === 'authenticated' && user ? user.preferredLang : selectedLang

  useEffect(() => {
    const controller = new AbortController()
    syncHtmlLang(activeLang)
    fetchI18nStrings(activeLang, controller.signal).then(
      (payload) => {
        setStrings(payload.strings)
        setAvailableLanguages(payload.availableLanguages)
        syncHtmlLang(payload.lang)
      },
      () => {},
    )
    return () => controller.abort()
  }, [activeLang])

  const changeLanguage = useCallback(
    async (nextLang: SupportedLang) => {
      if (switching) return
      setSwitching(true)
      try {
        setSelectedLang(nextLang)
        if (status === 'authenticated') {
          await updateMyProfile({ preferredLang: nextLang })
          await refreshProfile()
        }
        const payload = await fetchI18nStrings(nextLang)
        setStrings(payload.strings)
        setAvailableLanguages(payload.availableLanguages)
        syncHtmlLang(payload.lang)
      } finally {
        setSwitching(false)
      }
    },
    [refreshProfile, status, switching],
  )

  return (
    <I18nContext.Provider
      value={{
        lang: activeLang,
        strings,
        availableLanguages,
        switching,
        changeLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}
