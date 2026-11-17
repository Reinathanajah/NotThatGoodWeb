import type { AssignmentTimeRemainingDto } from '../types/activities.ts'

function pluralUnit(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`
}

export function formatDurationParts(absSeconds: number): string {
  const days = Math.floor(absSeconds / 86_400)
  const hours = Math.floor((absSeconds % 86_400) / 3_600)
  const minutes = Math.floor((absSeconds % 3_600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(pluralUnit(days, 'day', 'days'))
  if (hours > 0) parts.push(pluralUnit(hours, 'hour', 'hours'))
  if (parts.length === 0) {
    parts.push(pluralUnit(Math.max(1, minutes), 'minute', 'minutes'))
  }
  return parts.join(' ')
}

export function computeLiveTimeRemaining(
  dueAtIso: string,
  submittedAtIso: string | null,
  nowMs: number,
): AssignmentTimeRemainingDto {
  const referenceMs = submittedAtIso ? new Date(submittedAtIso).getTime() : nowMs
  const dueMs = new Date(dueAtIso).getTime()
  const diffSeconds = Math.floor((dueMs - referenceMs) / 1000)
  const isOverdue = diffSeconds < 0
  const label = formatDurationParts(Math.abs(diffSeconds))

  const humanReadable = submittedAtIso
    ? isOverdue
      ? `Submitted ${label} late`
      : `Submitted ${label} early`
    : isOverdue
      ? `Assignment is overdue by ${label}`
      : `${label} remaining`

  return { secondsRemaining: diffSeconds, isOverdue, humanReadable }
}

export function getAssignmentWindowState(
  opensAtIso: string | null,
  dueAtIso: string,
  cutoffAtIso: string | null,
  nowMs: number,
): 'upcoming' | 'open' | 'overdue' | 'closed' {
  if (opensAtIso && nowMs < new Date(opensAtIso).getTime()) return 'upcoming'
  if (cutoffAtIso && nowMs > new Date(cutoffAtIso).getTime()) return 'closed'
  if (nowMs > new Date(dueAtIso).getTime()) return 'overdue'
  return 'open'
}
