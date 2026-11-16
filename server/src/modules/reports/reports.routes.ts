import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as reportsController from './reports.controller.js'
import {
  learnerScriptKeyParamsSchema,
  learnerScriptReportQuerySchema,
} from './reports.schemas.js'

export const reportsRouter = Router()

reportsRouter.use(requireAuth)

reportsRouter.get(
  '/learner-script',
  reportsController.handleListLearnerScriptReports,
)

reportsRouter.get(
  '/learner-script/:key',
  validateRequest({
    params: learnerScriptKeyParamsSchema,
    query: learnerScriptReportQuerySchema,
  }),
  reportsController.handleGetLearnerScriptReport,
)
