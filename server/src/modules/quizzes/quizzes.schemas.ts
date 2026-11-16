import { z } from 'zod'

export const quizModuleParamsSchema = z.object({
  moduleId: z.coerce.number().int().positive('Module ID must be a positive integer'),
})

export const attemptIdParamsSchema = z.object({
  attemptId: z.string().uuid('attemptId must be a valid UUID'),
})

export const saveAnswersSchema = z.object({
  answers: z.record(
    z.string().min(1),
    z.number().int().min(0, 'Option index must be non-negative'),
  ),
})

export const submitAttemptSchema = z.object({
  answers: z
    .record(
      z.string().min(1),
      z.number().int().min(0, 'Option index must be non-negative'),
    )
    .optional(),
})
