import { z } from 'zod'

export const resourceModuleParamsSchema = z.object({
  moduleId: z.coerce.number().int().positive('Module ID must be a positive integer'),
})

export const resourceDownloadQuerySchema = z.object({
  disposition: z.enum(['attachment', 'inline']).default('attachment'),
})
