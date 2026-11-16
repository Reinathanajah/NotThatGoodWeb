import { z } from 'zod'

export const calendarEventsQuerySchema = z.object({
  view: z.enum(['month', 'day', 'upcoming']).default('month'),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  day: z.coerce.number().int().min(1).max(31).optional(),
  courseId: z.coerce.number().int().positive().optional(),
  includeHiddenScopes: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
})

export const createCalendarEventSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    description: z.string().trim().max(2000).nullable().optional(),
    scope: z
      .enum(['site', 'category', 'course', 'group', 'user', 'other'])
      .default('user'),
    courseId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    groupId: z.coerce.number().int().positive().optional(),
    startAt: z.string().datetime({ offset: true }),
    endAt: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .refine(
    (payload) =>
      !payload.endAt ||
      new Date(payload.endAt).getTime() >= new Date(payload.startAt).getTime(),
    'endAt must be greater than or equal to startAt',
  )

export const calendarEventIdParamsSchema = z.object({
  id: z.string().uuid('Event ID must be a valid UUID'),
})
