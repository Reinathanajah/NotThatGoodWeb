import { z } from 'zod'

export const createSupportTicketSchema = z.object({
  email: z.string().trim().email('Valid email address is required').max(255).optional(),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(255),
  message: z
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(4000),
})
