import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendSuccess } from '../../utils/response.js'
import { timelineQuerySchema } from './dashboard.schemas.js'
import {
  getDashboardTimeline,
  type TimelineFilter,
  type TimelineSort,
} from './dashboard.service.js'

export const dashboardRouter = Router()

dashboardRouter.get(
  '/timeline',
  requireAuth,
  validateRequest({ query: timelineQuerySchema }),
  async (req, res) => {
    const { filter, sort, search, offset, limit } = req.validated!.query as {
      filter: TimelineFilter
      sort: TimelineSort
      search?: string
      offset: number
      limit: number
    }
    const result = await getDashboardTimeline(req.auth!.userId, {
      filter,
      sort,
      search,
      offset,
      limit,
    })
    sendSuccess(res, result.items, { pagination: result.meta })
  },
)
