export const SCOPE_LEGEND = [
  { scope: 'site', label: 'Site events', colorToken: '#16a34a' },
  { scope: 'category', label: 'Category events', colorToken: '#7c3aed' },
  { scope: 'course', label: 'Course events', colorToken: '#ea580c' },
  { scope: 'group', label: 'Group events', colorToken: '#db2777' },
  { scope: 'user', label: 'User events', colorToken: '#2563eb' },
  { scope: 'other', label: 'Other events', colorToken: '#64748b' },
]

function extractZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  }
}

/** Resolve UTC instant corresponding to 00:00:00 on the specified calendar date in `timeZone`. */
export function zonedMidnightUtc(
  year: number,
  month: number,
  day: number,
  timeZone: string,
): Date {
  let candidateMs = Date.UTC(year, month - 1, day, 0, 0, 0)
  for (let pass = 0; pass < 2; pass++) {
    const local = extractZoneParts(new Date(candidateMs), timeZone)
    const localAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    )
    const targetAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0)
    candidateMs += targetAsUtc - localAsUtc
  }
  return new Date(candidateMs)
}

export function resolveWindowBounds(options: {
  view: 'month' | 'day' | 'upcoming'
  year?: number
  month?: number
  day?: number
  timezone: string
}): { startAt: Date; endAt: Date } {
  const now = new Date()
  const nowLocal = extractZoneParts(now, options.timezone)
  const year = options.year ?? nowLocal.year
  const month = options.month ?? nowLocal.month

  if (options.view === 'upcoming') {
    return { startAt: now, endAt: new Date(now.getTime() + 30 * 86_400_000) }
  }

  if (options.view === 'day') {
    const day = options.day ?? nowLocal.day
    return {
      startAt: zonedMidnightUtc(year, month, day, options.timezone),
      endAt: zonedMidnightUtc(year, month, day + 1, options.timezone),
    }
  }

  return {
    startAt: zonedMidnightUtc(year, month, 1, options.timezone),
    endAt: zonedMidnightUtc(year, month + 1, 1, options.timezone),
  }
}

export function formatDayKeyInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
