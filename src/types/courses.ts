import type { BreadcrumbDto, CategorySummaryDto } from './api.ts'

export interface TimelineItemDto {
  moduleId: number
  moodleModuleId: number | null
  moduleType: 'assign' | 'quiz'
  title: string
  actionLabel: string
  status: 'overdue' | 'upcoming' | 'submitted'
  opensAt: string | null
  dueAt: string
  course: {
    id: number
    moodleCourseId: number | null
    code: string
    title: string
    shortName: string
  }
}

export interface CourseCompletionDto {
  completedModules: number
  totalTrackableModules: number
  percentage: number | null
}

export interface CourseSummaryDto {
  id: number
  moodleCourseId: number | null
  code: string
  title: string
  shortName: string
  format: string
  coverStyle: string | null
  startAt: string | null
  endAt: string | null
  status?: 'in_progress' | 'future' | 'past'
  isEnrolled?: boolean
  enrollmentRole?: string
  isStarred?: boolean
  isHidden?: boolean
  lastAccessedAt?: string | null
  category: CategorySummaryDto | null
  term: { id: number; code: string; label: string } | null
  completion?: CourseCompletionDto
}

export interface RecentCourseDto {
  id: number
  moodleCourseId: number | null
  code: string
  title: string
  shortName: string
  coverStyle: string | null
  lastAccessedAt: string
  termLabel: string | null
  categoryName: string | null
}

export interface CourseModuleResourceFileDto {
  id: string
  displayName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

export interface CourseModuleDto {
  id: number
  moodleModuleId: number | null
  moduleType: 'assign' | 'quiz' | 'resource' | 'label' | 'url'
  title: string
  subsectionLabel: string | null
  descriptionHtml: string | null
  externalUrl: string | null
  position: number
  completionTrackable: boolean
  isCompleted: boolean
  completedAt: string | null
  opensAt: string | null
  dueOrClosedAt: string | null
  resource: {
    resourceKind: string
    displayMode: string
    file: CourseModuleResourceFileDto | null
  } | null
}

export interface CourseSectionDto {
  id: number
  title: string
  summaryText: string | null
  position: number
  isCollapsedDefault: boolean
  weekStart: string | null
  weekEnd: string | null
  modules: CourseModuleDto[]
}

export interface CourseDetailDto {
  id: number
  moodleCourseId: number | null
  code: string
  title: string
  shortName: string
  format: string
  summaryHtml: string | null
  coverStyle: string | null
  startAt: string | null
  endAt: string | null
  breadcrumbs: BreadcrumbDto[]
  term: { id: number; code: string; label: string } | null
  enrollment: {
    role: string
    isStarred: boolean
    isHidden: boolean
    groups: Array<{ id: number; name: string }>
  }
  lecturers: Array<{
    userId: string
    fullName: string
    role: string
    email: string | null
  }>
  completion: CourseCompletionDto
  sections: CourseSectionDto[]
}

export type { ResourceDetailDto } from './resources.ts'
