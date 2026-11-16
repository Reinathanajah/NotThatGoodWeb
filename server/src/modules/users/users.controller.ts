import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as usersService from './users.service.js'

export async function handleGetMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await usersService.getUserProfileById(req.auth!.userId)
  sendSuccess(res, profile)
}

export async function handleUpdateMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await usersService.updateUserProfile(
    req.auth!.userId,
    req.body as usersService.UpdateProfileInput,
  )
  sendSuccess(res, profile)
}

export async function handleUpdateMyPreferences(
  req: Request,
  res: Response,
): Promise<void> {
  const preferences = await usersService.updateUserPreferences(
    req.auth!.userId,
    req.body as usersService.UpdatePreferencesInput,
  )
  sendSuccess(res, preferences)
}
