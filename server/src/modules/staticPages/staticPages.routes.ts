import { Router } from 'express'
import { optionalAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as staticPagesController from './staticPages.controller.js'
import { staticPageSlugParamsSchema } from './staticPages.schemas.js'

export const staticPagesRouter = Router()

staticPagesRouter.get(
  '/:slug',
  optionalAuth,
  validateRequest({ params: staticPageSlugParamsSchema }),
  staticPagesController.handleGetStaticPage,
)
