import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as calendarController from './calendar.controller.js'
import {
  calendarEventIdParamsSchema,
  calendarEventsQuerySchema,
  createCalendarEventSchema,
} from './calendar.schemas.js'

export const calendarRouter = Router()

calendarRouter.use(requireAuth)

calendarRouter.get(
  '/events',
  validateRequest({ query: calendarEventsQuerySchema }),
  calendarController.handleListEvents,
)
calendarRouter.post(
  '/events',
  validateRequest({ body: createCalendarEventSchema }),
  calendarController.handleCreateEvent,
)
calendarRouter.delete(
  '/events/:id',
  validateRequest({ params: calendarEventIdParamsSchema }),
  calendarController.handleDeleteEvent,
)
