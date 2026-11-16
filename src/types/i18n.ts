import type { SupportedLang } from './auth.ts'

export interface LanguageOptionDto {
  code: SupportedLang
  label: string
}

export interface I18nStringsMap {
  auth: {
    loginTitle: string
    usernamePlaceholder: string
    passwordPlaceholder: string
    loginButton: string
    lostPassword: string
    cookiesNotice: string
  }
  nav: Record<string, string>
  dashboard: Record<string, string>
  profile: Record<string, string>
  assignment: Record<string, string>
  files: Record<string, string>
  calendar: Record<string, string>
  common: Record<string, string>
}

export interface I18nPayloadDto {
  lang: SupportedLang
  source: 'query' | 'user_preference' | 'accept_language' | 'default'
  availableLanguages: LanguageOptionDto[]
  strings: I18nStringsMap
}
