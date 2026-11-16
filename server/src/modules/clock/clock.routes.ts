import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { optionalAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendSuccess } from '../../utils/response.js'
import { isValidIanaTimezone } from '../../utils/timezone.js'

const clockQuerySchema = z.object({
  targetTimezone: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine(isValidIanaTimezone, 'Invalid IANA timezone')
    .optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
})

function formatClockInZone(date: Date, timeZone: string) {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  const tzPart =
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00'

  const offset = tzPart === 'GMT' ? '+00:00' : tzPart.replace('GMT', '')

  return {
    timezone: timeZone,
    offset,
    formatted,
  }
}

export const clockRouter = Router()

clockRouter.get(
  '/',
  optionalAuth,
  validateRequest({ query: clockQuerySchema }),
  async (req, res) => {
    const { targetTimezone, timestamp } = req.validated!.query as {
      targetTimezone?: string
      timestamp?: string
    }

    let userTimezone = 'UTC'
    if (req.auth) {
      const [user] = await db
        .select({ timezone: users.timezone })
        .from(users)
        .where(eq(users.id, req.auth.userId))
        .limit(1)
      if (user?.timezone) {
        userTimezone = user.timezone
      }
    }

    const referenceDate = timestamp ? new Date(timestamp) : new Date()
    const convertZone = targetTimezone ?? userTimezone

    sendSuccess(res, {
      utcIso: referenceDate.toISOString(),
      server: formatClockInZone(referenceDate, 'UTC'),
      user: formatClockInZone(referenceDate, userTimezone),
      converted: formatClockInZone(referenceDate, convertZone),
    })
  },
)
