import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as gradesController from './grades.controller.js'
import { gradesOverviewQuerySchema } from './grades.schemas.js'

export const gradesRouter = Router()

gradesRouter.use(requireAuth)

gradesRouter.get(
  '/overview',
  validateRequest({ query: gradesOverviewQuerySchema }),
  gradesController.handleGetGradesOverview,
)
