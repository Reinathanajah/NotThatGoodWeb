export interface GradesOverviewCourseDto {
  courseId: number
  moodleCourseId: number | null
  code: string
  title: string
  shortName: string
  termLabel: string | null
  finalGrade: number | null
  formattedGrade: string
  letterGrade: string | null
  gradedItemsCount: number
  totalItemsCount: number
}

export interface GradesOverviewDto {
  title: string
  courses: GradesOverviewCourseDto[]
  summary: { totalCourses: number; gradedCourses: number }
}

export interface CourseGradebookItemDto {
  id: number
  name: string
  moduleId: number | null
  moodleModuleId: number | null
  moduleType: string | null
  maxGrade: number
  weight: number
  isHiddenFromStudents?: boolean
  score: number | null
  percentage: number | null
  formattedGrade: string
  letterGrade: string | null
  feedback: string | null
  gradedAt: string | null
  graderName: string | null
}

export interface CourseGradebookDto {
  course: {
    id: number
    moodleCourseId: number | null
    code: string
    title: string
    shortName: string
  }
  courseTotal: {
    score: number | null
    formattedGrade: string
    letterGrade: string | null
    gradedItemsCount: number
    totalItemsCount: number
  }
  items: CourseGradebookItemDto[]
}

export interface LearnerScriptListDto {
  canManageReports: boolean
  manageReportsUrl: string | null
  reports: Array<{
    key: string
    title: string
    description: string | null
    reportType: string
    metrics: string[]
  }>
  snapshot: Record<string, unknown>
}

export interface LearnerScriptDetailDto {
  report: {
    key: string
    title: string
    description: string | null
    reportType: string
    config: Record<string, unknown>
    canManageReports: boolean
  }
  columns: Array<{ key: string; label: string }>
  rows: Array<Record<string, unknown>>
  summary: Record<string, unknown>
}
