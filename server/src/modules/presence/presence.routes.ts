import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as presenceController from './presence.controller.js'

export const presenceRouter = Router()

presenceRouter.post('/heartbeat', requireAuth, presenceController.handleHeartbeat)
presenceRouter.get('/online', presenceController.handleGetOnline)
