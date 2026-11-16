import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as authController from './auth.controller.js'
import {
  forgotPasswordSchema,
  loginSchema,
  mobileQrExchangeSchema,
  resetPasswordSchema,
  sessionIdParamsSchema,
} from './auth.schemas.js'

export const authRouter = Router()

authRouter.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.handleLogin,
)
authRouter.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema }),
  authController.handleForgotPassword,
)
authRouter.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema }),
  authController.handleResetPassword,
)
authRouter.post(
  '/mobile-qr/exchange',
  validateRequest({ body: mobileQrExchangeSchema }),
  authController.handleExchangeMobileQr,
)

authRouter.post('/logout', requireAuth, authController.handleLogout)
authRouter.get('/me', requireAuth, authController.handleMe)
authRouter.get('/sessions', requireAuth, authController.handleListSessions)
authRouter.delete(
  '/sessions/:sessionId',
  requireAuth,
  validateRequest({ params: sessionIdParamsSchema }),
  authController.handleRevokeSession,
)
authRouter.post('/mobile-qr', requireAuth, authController.handleCreateMobileQr)
