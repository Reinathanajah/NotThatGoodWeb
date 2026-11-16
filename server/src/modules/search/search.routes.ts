import { Router } from 'express'
import { optionalAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendSuccess } from '../../utils/response.js'
import { globalSearchQuerySchema } from './search.schemas.js'
import { runGlobalSearch, type SearchScope } from './search.service.js'

export const searchRouter = Router()

searchRouter.get(
  '/',
  optionalAuth,
  validateRequest({ query: globalSearchQuerySchema }),
  async (req, res) => {
    const { q, scope, limit } = req.validated!.query as {
      q: string
      scope: SearchScope
      limit: number
    }
    const result = await runGlobalSearch({
      q,
      scope,
      limit,
      userId: req.auth?.userId,
    })
    sendSuccess(res, result)
  },
)
