import {
  resolveCategoryHref,
  resolveCourseHref,
  resolveModuleHref,
} from '../../lib/appRoutes.ts'
import type { SearchResultsDto, SearchScope } from '../../types/navigation.ts'

export const SEARCH_SCOPES: Array<{ id: SearchScope; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'courses', label: 'Courses' },
  { id: 'categories', label: 'Categories' },
  { id: 'modules', label: 'Activities' },
  { id: 'pages', label: 'Guides' },
]

export const SUGGESTED_SEARCH_QUERIES = [
  'Engineering',
  'Medicine',
  'Least Squares',
  'Role Guides',
] as const

export interface FlatSearchItem {
  key: string
  group: 'courses' | 'categories' | 'modules' | 'pages'
  groupLabel: string
  title: string
  subtitle: string
  badge: string
  href: string
}

export function flattenSearchResults(data: SearchResultsDto | null): FlatSearchItem[] {
  if (!data) return []
  const items: FlatSearchItem[] = []

  for (const c of data.results.courses) {
    items.push({
      key: `course-${c.id}`,
      group: 'courses',
      groupLabel: 'Courses',
      title: c.title,
      subtitle: `${c.code}${c.categoryName ? ` · ${c.categoryName}` : ''}`,
      badge: c.isEnrolled ? 'Enrolled' : 'Catalog',
      href: resolveCourseHref(c),
    })
  }

  for (const cat of data.results.categories) {
    items.push({
      key: `cat-${cat.id}`,
      group: 'categories',
      groupLabel: 'Faculties & Programs',
      title: cat.name,
      subtitle: `Category slug: ${cat.slug}`,
      badge: 'Directory',
      href: resolveCategoryHref(cat),
    })
  }

  for (const mod of data.results.modules) {
    items.push({
      key: `mod-${mod.id}`,
      group: 'modules',
      groupLabel: 'Activities & Modules',
      title: mod.title,
      subtitle: `${mod.courseTitle}${mod.subsectionLabel ? ` · ${mod.subsectionLabel}` : ''}`,
      badge: mod.moduleType.toUpperCase(),
      href: resolveModuleHref(mod),
    })
  }

  for (const page of data.results.pages) {
    items.push({
      key: `page-${page.slug}`,
      group: 'pages',
      groupLabel: 'Guides & Pages',
      title: page.title,
      subtitle: `/static/${page.slug}`,
      badge: 'Guide',
      href: `/static/${page.slug}`,
    })
  }

  return items
}

export function splitHighlightChunks(
  text: string,
  query: string,
): Array<{ text: string; matched: boolean }> {
  const q = query.trim()
  if (!q) return [{ text, matched: false }]
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text
    .split(regex)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      matched: part.toLowerCase() === q.toLowerCase(),
    }))
}
