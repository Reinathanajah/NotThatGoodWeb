import { z } from 'zod'

export const courseIdParamsSchema = z.object({
  id: z.coerce.number().int().positive('Course ID must be a positive integer'),
})

export const courseModuleParamsSchema = z.object({
  id: z.coerce.number().int().positive('Course ID must be a positive integer'),
  moduleId: z.coerce.number().int().positive('Module ID must be a positive integer'),
})

export const myCoursesQuerySchema = z.object({
  filter: z
    .enum(['all', 'in_progress', 'future', 'past', 'starred', 'hidden'])
    .default('all'),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['name', 'last_accessed']).default('name'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(0).max(50).default(12),
})

export const recentCoursesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
})

export const updateCoursePreferenceSchema = z
  .object({
    isStarred: z.boolean().optional(),
    isHidden: z.boolean().optional(),
  })
  .refine(
    (payload) => payload.isStarred !== undefined || payload.isHidden !== undefined,
    'At least one preference field (isStarred or isHidden) is required',
  )
