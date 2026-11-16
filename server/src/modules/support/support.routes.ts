import { Router } from 'express'
import { optionalAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as supportController from './support.controller.js'
import { createSupportTicketSchema } from './support.schemas.js'

export const supportRouter = Router()

supportRouter.get('/status', optionalAuth, supportController.handleGetSupportStatus)

supportRouter.post(
  '/tickets',
  optionalAuth,
  validateRequest({ body: createSupportTicketSchema }),
  supportController.handleCreateSupportTicket,
)
