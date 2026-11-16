import { z } from 'zod'

export const timelineQuerySchema = z.object({
  filter: z.enum(['all', 'overdue', 'next_7_days', 'next_30_days']).default('all'),
  sort: z.enum(['dates', 'courses']).default('dates'),
  search: z.string().trim().max(120).optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})
