import type { BreadcrumbDto, CategorySummaryDto } from './api.ts'

export interface NavigationItemDto {
  id: number
  label: string
  href: string
  categoryId: number | null
  targetRole: string
  isExternal: boolean
  sortOrder: number
  isHighlightedForRole?: boolean
}

export interface FacultyNavItemDto {
  id: number
  moodleCategoryId: number | null
  label: string
  slug: string
  depth: number
  href: string
}

export interface NavigationMenusDto {
  primary: NavigationItemDto[]
  facultyHomepage: FacultyNavItemDto[]
  portalLinks: NavigationItemDto[]
  guideLinks: NavigationItemDto[]
  external: NavigationItemDto[]
  announcements: NavigationItemDto[]
}

export interface CategoryNodeDto {
  id: number
  moodleCategoryId: number | null
  parentId: number | null
  name: string
  slug: string
  path: string
  depth: number
  sortOrder: number
  description: string | null
  directCourseCount: number
  childCount?: number
  children?: CategoryNodeDto[]
}

export interface CategoryDetailDto {
  category: CategoryNodeDto
  ancestors: BreadcrumbDto[]
  children: CategoryNodeDto[]
}

export type SearchScope = 'all' | 'courses' | 'categories' | 'modules' | 'pages'

export interface SearchResultsDto {
  query: string
  scope: SearchScope
  counts: {
    courses: number
    categories: number
    modules: number
    pages: number
    total: number
  }
  results: {
    courses: Array<{
      id: number
      moodleCourseId: number | null
      code: string
      title: string
      shortName: string
      categoryName: string | null
      isEnrolled: boolean
    }>
    categories: CategorySummaryDto[]
    modules: Array<{
      id: number
      moodleModuleId: number | null
      courseId: number
      moduleType: string
      title: string
      subsectionLabel: string | null
      courseTitle: string
      isEnrolled: boolean
    }>
    pages: Array<{ slug: string; title: string }>
  }
}
