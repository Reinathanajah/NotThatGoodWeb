import { z } from 'zod'

export const globalSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query q is required').max(120),
  scope: z
    .enum(['all', 'courses', 'categories', 'modules', 'pages'])
    .default('all'),
  limit: z.coerce.number().int().min(1).max(30).default(10),
})
