import { z } from 'zod'

export const listNotificationsQuerySchema = z.object({
  unreadOnly: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const notificationIdParamsSchema = z.object({
  id: z.string().uuid('Notification ID must be a valid UUID'),
})
