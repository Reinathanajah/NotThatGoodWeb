export type TimelineFilter = 'all' | 'overdue' | 'next_7_days' | 'next_30_days'
export type TimelineSort = 'dates' | 'courses'
export type TimelineItemStatus = 'overdue' | 'upcoming' | 'submitted'

export interface TimelineItemDto {
  moduleId: number
  moodleModuleId: number | null
  moduleType: 'assign' | 'quiz'
  title: string
  actionLabel: string
  status: TimelineItemStatus
  opensAt: Date | null
  dueAt: Date
  course: {
    id: number
    moodleCourseId: number | null
    code: string
    title: string
    shortName: string
  }
}

export interface RawTimelineRow {
  moduleId: number
  moodleModuleId: number | null
  title: string
  opensAt: Date | null
  dueAt: Date
  courseId: number
  moodleCourseId: number | null
  courseCode: string
  courseTitle: string
  courseShortName: string
}

export function mapToTimelineItem(
  row: RawTimelineRow,
  moduleType: 'assign' | 'quiz',
  isSubmitted: boolean,
  nowMs: number,
): TimelineItemDto {
  const status: TimelineItemStatus = isSubmitted
    ? 'submitted'
    : row.dueAt.getTime() < nowMs
      ? 'overdue'
      : 'upcoming'

  return {
    moduleId: row.moduleId,
    moodleModuleId: row.moodleModuleId,
    moduleType,
    title: row.title,
    actionLabel: moduleType === 'assign' ? 'Assignment is due' : 'Quiz closes',
    status,
    opensAt: row.opensAt,
    dueAt: row.dueAt,
    course: {
      id: row.courseId,
      moodleCourseId: row.moodleCourseId,
      code: row.courseCode,
      title: row.courseTitle,
      shortName: row.courseShortName,
    },
  }
}
