import type { Request, Response } from 'express'
import { sendCreated, sendSuccess } from '../../utils/response.js'
import * as supportService from './support.service.js'

export function handleGetSupportStatus(req: Request, res: Response): void {
  const status = supportService.getSupportStatus(
    req.auth ? { userId: req.auth.userId, role: req.auth.role } : undefined,
  )
  sendSuccess(res, status)
}

export async function handleCreateSupportTicket(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.validated!.body as {
    email?: string
    subject: string
    message: string
  }
  const ticket = await supportService.createSupportTicket(body, req.auth?.userId)
  sendCreated(res, ticket)
}
