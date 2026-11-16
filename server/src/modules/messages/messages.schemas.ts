import { z } from 'zod'

export const conversationIdParamsSchema = z.object({
  id: z.string().uuid('Conversation ID must be a valid UUID'),
})

export const conversationMessagesQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(30),
})

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, 'Message body is required').max(4000),
})
