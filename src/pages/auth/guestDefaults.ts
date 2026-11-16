import type { I18nPayloadDto, LanguageOptionDto } from '../../types/i18n.ts'

export const LOGIN_FALLBACK_LABELS: I18nPayloadDto['strings']['auth'] = {
  loginTitle: 'Log in to SilverFour',
  usernamePlaceholder: 'Username or email',
  passwordPlaceholder: 'Password',
  loginButton: 'Log in',
  lostPassword: 'Lost password?',
  cookiesNotice: 'Cookies notice',
}

export const LOGIN_FALLBACK_LANGUAGES: LanguageOptionDto[] = [
  { code: 'en', label: 'English (en)' },
  { code: 'id', label: 'Bahasa Indonesia (id)' },
  { code: 'zh_cn', label: '简体中文 (zh_cn)' },
]
