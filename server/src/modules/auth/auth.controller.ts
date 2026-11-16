import type { Request, Response } from 'express'
import { sendCreated, sendSuccess } from '../../utils/response.js'
import * as authService from './auth.service.js'

function extractClientMetadata(req: Request) {
  return {
    userAgent: req.headers['user-agent'] ?? null,
    ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
  }
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { identifier, password } = req.body as { identifier: string; password: string }
  const result = await authService.loginUser(identifier, password, extractClientMetadata(req))
  sendSuccess(res, result)
}

export async function handleLogout(req: Request, res: Response): Promise<void> {
  await authService.logoutSession(req.auth!.userId, req.auth!.sessionId)
  sendSuccess(res, { loggedOut: true })
}

export async function handleMe(req: Request, res: Response): Promise<void> {
  const profile = await authService.getAuthenticatedProfile(req.auth!.userId)
  sendSuccess(res, profile)
}

export async function handleListSessions(req: Request, res: Response): Promise<void> {
  const sessions = await authService.listUserSessions(req.auth!.userId, req.auth!.sessionId)
  sendSuccess(res, sessions)
}

export async function handleRevokeSession(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params as { sessionId: string }
  const revoked = await authService.revokeUserSession(req.auth!.userId, sessionId)
  sendSuccess(res, revoked)
}

export async function handleForgotPassword(req: Request, res: Response): Promise<void> {
  const { identifier } = req.body as { identifier: string }
  const result = await authService.requestPasswordReset(identifier)
  sendSuccess(res, result)
}

export async function handleResetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body as { token: string; newPassword: string }
  const result = await authService.resetPasswordWithToken(token, newPassword)
  sendSuccess(res, result)
}

export async function handleCreateMobileQr(req: Request, res: Response): Promise<void> {
  const result = await authService.createMobileQrToken(req.auth!.userId)
  sendCreated(res, result)
}

export async function handleExchangeMobileQr(req: Request, res: Response): Promise<void> {
  const { qrToken } = req.body as { qrToken: string }
  const result = await authService.exchangeMobileQrToken(qrToken, extractClientMetadata(req))
  sendSuccess(res, result)
}
