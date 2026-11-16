import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendSuccess } from '../../utils/response.js'
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
} from './notifications.schemas.js'
import * as notificationsService from './notifications.service.js'

export const notificationsRouter = Router()

notificationsRouter.use(requireAuth)

notificationsRouter.get(
  '/',
  validateRequest({ query: listNotificationsQuerySchema }),
  async (req, res) => {
    const query = req.validated!.query as {
      unreadOnly: boolean
      page: number
      limit: number
    }
    const result = await notificationsService.listUserNotifications(
      req.auth!.userId,
      query,
    )
    sendSuccess(
      res,
      { items: result.items, unreadCount: result.unreadCount },
      { pagination: result.pagination },
    )
  },
)

notificationsRouter.post('/read-all', async (req, res) => {
  const result = await notificationsService.markAllNotificationsRead(req.auth!.userId)
  sendSuccess(res, result)
})

notificationsRouter.patch(
  '/:id/read',
  validateRequest({ params: notificationIdParamsSchema }),
  async (req, res) => {
    const { id } = req.validated!.params as { id: string }
    const result = await notificationsService.markNotificationRead(req.auth!.userId, id)
    sendSuccess(res, result)
  },
)
