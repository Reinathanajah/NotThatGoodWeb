function formatUnit(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`
}

export function formatDuration(absSeconds: number): string {
  const days = Math.floor(absSeconds / 86_400)
  const hours = Math.floor((absSeconds % 86_400) / 3_600)
  const minutes = Math.floor((absSeconds % 3_600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(formatUnit(days, 'day', 'days'))
  if (hours > 0) parts.push(formatUnit(hours, 'hour', 'hours'))
  if (parts.length === 0) {
    parts.push(formatUnit(Math.max(1, minutes), 'minute', 'minutes'))
  }
  return parts.join(' ')
}

export function computeTimeRemaining(dueAt: Date, submittedAt: Date | null) {
  const referenceMs = submittedAt ? submittedAt.getTime() : Date.now()
  const diffSeconds = Math.floor((dueAt.getTime() - referenceMs) / 1000)
  const isOverdue = diffSeconds < 0
  const label = formatDuration(Math.abs(diffSeconds))

  return {
    secondsRemaining: diffSeconds,
    isOverdue,
    humanReadable: submittedAt
      ? isOverdue
        ? `Submitted ${label} late`
        : `Submitted ${label} early`
      : isOverdue
        ? `Assignment is overdue by ${label}`
        : `${label} remaining`,
  }
}
