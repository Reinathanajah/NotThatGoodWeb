export const TIMEZONE_OPTIONS = [
  'UTC',
  'Asia/Jakarta',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
] as const

export function getTimezoneSelectOptions(currentTimezone: string): readonly string[] {
  return TIMEZONE_OPTIONS.includes(currentTimezone as (typeof TIMEZONE_OPTIONS)[number])
    ? TIMEZONE_OPTIONS
    : [currentTimezone, ...TIMEZONE_OPTIONS]
}
