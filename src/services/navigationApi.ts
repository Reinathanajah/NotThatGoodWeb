import type { UpdatePreferencesInput, UserPreferencesDto } from '../types/auth.ts'
import type { CategoryNodeDto, NavigationMenusDto } from '../types/navigation.ts'
import type { NotificationsListDto } from '../types/workspace.ts'
import { apiFetch } from './apiClient.ts'

export function fetchNavigationMenus(signal?: AbortSignal): Promise<NavigationMenusDto> {
  return apiFetch<NavigationMenusDto>('/navigation/menus', { signal })
}

export function fetchCategoryTree(depth = 2, signal?: AbortSignal): Promise<CategoryNodeDto[]> {
  return apiFetch<CategoryNodeDto[]>(`/categories?view=tree&depth=${depth}`, { signal })
}

export function updateMyPreferences(
  input: UpdatePreferencesInput,
): Promise<UserPreferencesDto> {
  return apiFetch<UserPreferencesDto>('/users/me/preferences', {
    method: 'PATCH',
    body: input,
  })
}

export function fetchUnreadBadgeCount(signal?: AbortSignal): Promise<NotificationsListDto> {
  return apiFetch<NotificationsListDto>('/notifications?limit=1', { signal })
}
