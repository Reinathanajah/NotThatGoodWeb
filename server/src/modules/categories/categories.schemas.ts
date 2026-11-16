import { z } from 'zod'

export const categoryListQuerySchema = z.object({
  view: z.enum(['tree', 'flat']).default('tree'),
  depth: z.coerce.number().int().min(0).max(5).optional(),
  parentId: z.coerce.number().int().positive().optional(),
})

export const categoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive('Category ID must be a positive integer'),
})

export const categoryCoursesQuerySchema = z.object({
  includeSubcategories: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})
