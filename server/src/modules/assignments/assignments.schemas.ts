import { z } from 'zod'

export const assignmentModuleParamsSchema = z.object({
  moduleId: z.coerce.number().int().positive('Module ID must be a positive integer'),
})

export const upsertSubmissionSchema = z.object({
  action: z.enum(['draft', 'submit']).default('submit'),
  onlineText: z.string().max(50_000).nullable().optional(),
  fileIds: z.array(z.string().uuid('Each fileId must be a valid UUID')).default([]),
  declarationAccepted: z.boolean().default(false),
})

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment body is required').max(2000),
})
