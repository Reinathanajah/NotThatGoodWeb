import type { AdjacentModulesDto } from './api.ts'
import type { CourseModuleResourceFileDto } from './courses.ts'

export interface ResourceDetailDto {
  moduleId: number
  moodleModuleId: number | null
  title: string
  subsectionLabel: string | null
  descriptionHtml: string | null
  resourceKind: string
  displayMode: string
  externalUrl?: string | null
  isCompleted: boolean
  completedAt: string | null
  course: { id: number; moodleCourseId: number | null; code: string; title: string }
  section: { id: number; title: string; position: number } | null
  file:
    | (CourseModuleResourceFileDto & {
        authorName: string | null
        license: string
        downloadUrl: string
      })
    | null
  navigation: AdjacentModulesDto
}
