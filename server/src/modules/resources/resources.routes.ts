import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as resourcesController from './resources.controller.js'
import {
  resourceDownloadQuerySchema,
  resourceModuleParamsSchema,
} from './resources.schemas.js'

export const resourcesRouter = Router()

resourcesRouter.use(requireAuth)

resourcesRouter.get(
  '/:moduleId',
  validateRequest({ params: resourceModuleParamsSchema }),
  resourcesController.handleGetResourceDetail,
)
resourcesRouter.get(
  '/:moduleId/download',
  validateRequest({
    params: resourceModuleParamsSchema,
    query: resourceDownloadQuerySchema,
  }),
  resourcesController.handleDownloadResource,
)
