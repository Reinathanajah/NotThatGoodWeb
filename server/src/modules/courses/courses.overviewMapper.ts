import { courses } from '../../db/schema.js'
import type { computeCourseCompletionMap } from './courses.completion.js'

type CourseCompletionMap = Awaited<ReturnType<typeof computeCourseCompletionMap>>

export interface MyCourseQueryRow {
  enrollmentId: number
  enrollmentRole: string
  isStarred: boolean
  isHidden: boolean
  id: number
  moodleCourseId: number | null
  code: string
  title: string
  shortName: string
  format: string
  coverStyle: typeof courses.$inferSelect.coverStyle | null
  startAt: Date | null
  endAt: Date | null
  categoryId: number | null
  categoryName: string | null
  categorySlug: string | null
  termId: number | null
  termCode: string | null
  termLabel: string | null
  lastAccessedAt: Date | null
}

function classifyCourseStatus(
  startAt: Date | null,
  endAt: Date | null,
  nowMs: number,
): 'in_progress' | 'future' | 'past' {
  if (startAt && startAt.getTime() > nowMs) return 'future'
  if (endAt && endAt.getTime() < nowMs) return 'past'
  return 'in_progress'
}

export function mapOverviewCourseRow(
  row: MyCourseQueryRow,
  completionMap: CourseCompletionMap,
  nowMs: number,
) {
  return {
    id: row.id,
    moodleCourseId: row.moodleCourseId,
    code: row.code,
    title: row.title,
    shortName: row.shortName,
    format: row.format,
    coverStyle: row.coverStyle,
    startAt: row.startAt,
    endAt: row.endAt,
    status: classifyCourseStatus(row.startAt, row.endAt, nowMs),
    enrollmentRole: row.enrollmentRole,
    isStarred: row.isStarred,
    isHidden: row.isHidden,
    lastAccessedAt: row.lastAccessedAt,
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName, slug: row.categorySlug }
      : null,
    term: row.termId
      ? { id: row.termId, code: row.termCode, label: row.termLabel }
      : null,
    completion: completionMap.get(row.id) ?? {
      completedModules: 0,
      totalTrackableModules: 0,
      percentage: null,
    },
  }
}
