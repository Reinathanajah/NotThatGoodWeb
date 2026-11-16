import {
  fetchSubmittedActivityIds,
  fetchVisibleCourseActivities,
} from './dashboard.queries.js'
import {
  mapToTimelineItem,
  type TimelineFilter,
  type TimelineItemDto,
  type TimelineSort,
} from './dashboard.types.js'

export {
  type TimelineFilter,
  type TimelineItemDto,
  type TimelineItemStatus,
  type TimelineSort,
} from './dashboard.types.js'

export async function getDashboardTimeline(
  userId: string,
  options: {
    filter: TimelineFilter
    sort: TimelineSort
    search?: string
    offset: number
    limit: number
  },
) {
  const { assignRows, quizRows } = await fetchVisibleCourseActivities(userId)
  const { submittedAssignIds, submittedQuizIds } = await fetchSubmittedActivityIds(
    userId,
    assignRows.map((r) => r.moduleId),
    quizRows.map((r) => r.moduleId),
  )

  const nowMs = Date.now()
  const allItems: TimelineItemDto[] = [
    ...assignRows.map((row) =>
      mapToTimelineItem(row, 'assign', submittedAssignIds.has(row.moduleId), nowMs),
    ),
    ...quizRows.map((row) =>
      mapToTimelineItem(row, 'quiz', submittedQuizIds.has(row.moduleId), nowMs),
    ),
  ]

  const sevenDaysMs = nowMs + 7 * 86_400_000
  const thirtyDaysMs = nowMs + 30 * 86_400_000
  const searchTerm = options.search?.toLowerCase()

  const filtered = allItems.filter((item) => {
    if (searchTerm) {
      const hay = `${item.title} ${item.course.title} ${item.course.code}`.toLowerCase()
      if (!hay.includes(searchTerm)) return false
    }

    const dueMs = item.dueAt.getTime()
    if (options.filter === 'overdue') return item.status === 'overdue'
    if (options.filter === 'next_7_days') {
      return item.status !== 'submitted' && dueMs >= nowMs && dueMs <= sevenDaysMs
    }
    if (options.filter === 'next_30_days') {
      return item.status !== 'submitted' && dueMs >= nowMs && dueMs <= thirtyDaysMs
    }
    return true
  })

  filtered.sort((a, b) => {
    if (options.sort === 'courses') {
      const courseCmp = a.course.title.localeCompare(b.course.title)
      if (courseCmp !== 0) return courseCmp
    }
    return a.dueAt.getTime() - b.dueAt.getTime()
  })

  const total = filtered.length
  const items = filtered.slice(options.offset, options.offset + options.limit)

  return {
    items,
    meta: {
      offset: options.offset,
      limit: options.limit,
      total,
      hasMore: options.offset + items.length < total,
    },
  }
}
