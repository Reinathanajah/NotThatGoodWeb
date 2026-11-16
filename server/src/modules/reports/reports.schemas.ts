import { z } from 'zod'

export const learnerScriptKeyParamsSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Report key is required')
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, 'Invalid report key format'),
})

export const learnerScriptReportQuerySchema = z.object({
  courseId: z.coerce.number().int().positive().optional(),
})
