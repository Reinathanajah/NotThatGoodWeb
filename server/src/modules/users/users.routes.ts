import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as usersController from './users.controller.js'
import { updatePreferencesSchema, updateProfileSchema } from './users.schemas.js'

export const usersRouter = Router()

usersRouter.get('/me/profile', requireAuth, usersController.handleGetMyProfile)
usersRouter.patch(
  '/me/profile',
  requireAuth,
  validateRequest({ body: updateProfileSchema }),
  usersController.handleUpdateMyProfile,
)
usersRouter.patch(
  '/me/preferences',
  requireAuth,
  validateRequest({ body: updatePreferencesSchema }),
  usersController.handleUpdateMyPreferences,
)
