import type { SearchResultsDto, SearchScope } from '../types/navigation.ts'
import { apiFetch } from './apiClient.ts'

export function runGlobalSearch(
  query: string,
  scope: SearchScope = 'all',
  limit = 10,
  signal?: AbortSignal,
): Promise<SearchResultsDto> {
  const params = new URLSearchParams({
    q: query,
    scope,
    limit: String(limit),
  })
  return apiFetch<SearchResultsDto>(`/search?${params.toString()}`, {
    signal,
    skipUnauthorizedEvent: true,
  })
}
