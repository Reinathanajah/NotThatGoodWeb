import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as presenceService from './presence.service.js'

export async function handleHeartbeat(req: Request, res: Response): Promise<void> {
  const result = await presenceService.recordHeartbeat(req.auth!.userId)
  sendSuccess(res, result)
}

export async function handleGetOnline(_req: Request, res: Response): Promise<void> {
  const result = await presenceService.getOnlinePresence()
  sendSuccess(res, result)
}
