import type { SupportedLang } from '../types/auth.ts'
import type { I18nPayloadDto } from '../types/i18n.ts'
import type {
  HealthPayloadDto,
  StaticPageDto,
  SupportStatusDto,
} from '../types/workspace.ts'
import { apiFetch } from './apiClient.ts'

export function fetchApiHealth(signal?: AbortSignal): Promise<HealthPayloadDto> {
  return apiFetch<HealthPayloadDto>('/health', {
    signal,
    skipAuth: true,
    skipUnauthorizedEvent: true,
  })
}

export function fetchI18nStrings(
  lang?: SupportedLang,
  signal?: AbortSignal,
): Promise<I18nPayloadDto> {
  const query = lang ? `?lang=${encodeURIComponent(lang)}` : ''
  return apiFetch<I18nPayloadDto>(`/i18n/strings${query}`, {
    signal,
    skipUnauthorizedEvent: true,
  })
}

export function fetchStaticPage(slug: string, signal?: AbortSignal): Promise<StaticPageDto> {
  return apiFetch<StaticPageDto>(`/static-pages/${encodeURIComponent(slug)}`, {
    signal,
    skipUnauthorizedEvent: true,
  })
}

export function fetchSupportStatus(signal?: AbortSignal): Promise<SupportStatusDto> {
  return apiFetch<SupportStatusDto>('/support/status', {
    signal,
    skipUnauthorizedEvent: true,
  })
}
