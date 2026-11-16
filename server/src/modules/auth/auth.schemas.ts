import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or email is required'),
})

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(16, 'Invalid reset token'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
})

export const mobileQrExchangeSchema = z.object({
  qrToken: z.string().trim().min(16, 'Invalid QR token'),
})
