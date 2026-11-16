import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as assignmentsController from './assignments.controller.js'
import {
  assignmentModuleParamsSchema,
  createCommentSchema,
  upsertSubmissionSchema,
} from './assignments.schemas.js'

export const assignmentsRouter = Router()

assignmentsRouter.use(requireAuth)

assignmentsRouter.get(
  '/:moduleId',
  validateRequest({ params: assignmentModuleParamsSchema }),
  assignmentsController.handleGetAssignmentDetail,
)
assignmentsRouter.put(
  '/:moduleId/submission',
  validateRequest({
    params: assignmentModuleParamsSchema,
    body: upsertSubmissionSchema,
  }),
  assignmentsController.handleUpsertSubmission,
)
assignmentsRouter.get(
  '/:moduleId/comments',
  validateRequest({ params: assignmentModuleParamsSchema }),
  assignmentsController.handleListComments,
)
assignmentsRouter.post(
  '/:moduleId/comments',
  validateRequest({
    params: assignmentModuleParamsSchema,
    body: createCommentSchema,
  }),
  assignmentsController.handleAddComment,
)
assignmentsRouter.post(
  '/:moduleId/plagiarism/submit',
  validateRequest({ params: assignmentModuleParamsSchema }),
  assignmentsController.handleTriggerPlagiarism,
)
assignmentsRouter.get(
  '/:moduleId/plagiarism/status',
  validateRequest({ params: assignmentModuleParamsSchema }),
  assignmentsController.handleGetPlagiarismStatus,
)
