import type { NavigationItemDto } from '../../types/navigation.ts'

export const FALLBACK_PRIMARY_LINKS: NavigationItemDto[] = [
  { id: 1, label: 'Home', href: '/', categoryId: null, targetRole: 'all', isExternal: false, sortOrder: 1 },
  { id: 2, label: 'Dashboard', href: '/my', categoryId: null, targetRole: 'all', isExternal: false, sortOrder: 2 },
  { id: 3, label: 'My courses', href: '/my/courses', categoryId: null, targetRole: 'all', isExternal: false, sortOrder: 3 },
]

export const ACCOUNT_WORKSPACE_LINKS = [
  { label: 'Profile', href: '/user/profile' },
  { label: 'Grades', href: '/grades' },
  { label: 'Private files', href: '/user/files' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Messages', href: '/messages' },
  { label: 'Notifications', href: '/notifications' },
] as const
