import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  academicTerms,
  categories,
  courseAccessLogs,
  courses,
  enrollments,
} from '../../db/schema.js'
import { computeCourseCompletionMap } from './courses.completion.js'
import { mapOverviewCourseRow } from './courses.overviewMapper.js'

export type CourseOverviewFilter =
  | 'all'
  | 'in_progress'
  | 'future'
  | 'past'
  | 'starred'
  | 'hidden'

export type CourseOverviewSort = 'name' | 'last_accessed'

export async function listMyCourses(
  userId: string,
  options: {
    filter: CourseOverviewFilter
    search?: string
    sort: CourseOverviewSort
    page: number
    limit: number
  },
) {
  const rows = await db
    .select({
      enrollmentId: enrollments.id,
      enrollmentRole: enrollments.role,
      isStarred: enrollments.isStarred,
      isHidden: enrollments.isHidden,
      id: courses.id,
      moodleCourseId: courses.moodleCourseId,
      code: courses.code,
      title: courses.title,
      shortName: courses.shortName,
      format: courses.format,
      coverStyle: courses.coverStyle,
      startAt: courses.startAt,
      endAt: courses.endAt,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      termId: academicTerms.id,
      termCode: academicTerms.code,
      termLabel: academicTerms.label,
      lastAccessedAt: courseAccessLogs.lastAccessedAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(academicTerms, eq(courses.termId, academicTerms.id))
    .leftJoin(
      courseAccessLogs,
      and(
        eq(courseAccessLogs.courseId, courses.id),
        eq(courseAccessLogs.userId, enrollments.userId),
      ),
    )
    .where(and(eq(enrollments.userId, userId), eq(courses.visible, true)))

  const completionMap = await computeCourseCompletionMap(
    userId,
    rows.map((r) => r.id),
  )

  const nowMs = Date.now()
  const searchTerm = options.search?.toLowerCase()
  const enriched = rows.map((row) => mapOverviewCourseRow(row, completionMap, nowMs))

  const filtered = enriched.filter((item) => {
    if (options.filter === 'hidden') {
      if (!item.isHidden) return false
    } else {
      if (item.isHidden) return false
      if (options.filter === 'starred' && !item.isStarred) return false
      if (options.filter === 'in_progress' && item.status !== 'in_progress') return false
      if (options.filter === 'future' && item.status !== 'future') return false
      if (options.filter === 'past' && item.status !== 'past') return false
    }

    if (searchTerm) {
      const hay = `${item.title} ${item.shortName} ${item.code} ${item.term?.label ?? ''}`.toLowerCase()
      if (!hay.includes(searchTerm)) return false
    }
    return true
  })

  filtered.sort((a, b) => {
    if (options.sort === 'last_accessed') {
      const aTime = a.lastAccessedAt?.getTime() ?? 0
      const bTime = b.lastAccessedAt?.getTime() ?? 0
      if (bTime !== aTime) return bTime - aTime
    }
    return a.title.localeCompare(b.title)
  })

  const total = filtered.length
  const effectiveLimit = options.limit === 0 ? Math.max(1, total) : options.limit
  const offset = options.limit === 0 ? 0 : (options.page - 1) * options.limit
  const items = options.limit === 0 ? filtered : filtered.slice(offset, offset + options.limit)

  return {
    items,
    meta: {
      page: options.limit === 0 ? 1 : options.page,
      limit: options.limit,
      total,
      totalPages: options.limit === 0 ? 1 : Math.max(1, Math.ceil(total / effectiveLimit)),
    },
  }
}
