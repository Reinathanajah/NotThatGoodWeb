import { z } from 'zod'

export const staticPageSlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Page slug is required')
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, 'Invalid static page slug'),
})
