import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as quizzesController from './quizzes.controller.js'
import {
  attemptIdParamsSchema,
  quizModuleParamsSchema,
  saveAnswersSchema,
  submitAttemptSchema,
} from './quizzes.schemas.js'

export const quizzesRouter = Router()

quizzesRouter.use(requireAuth)

quizzesRouter.patch(
  '/attempts/:attemptId/answers',
  validateRequest({
    params: attemptIdParamsSchema,
    body: saveAnswersSchema,
  }),
  quizzesController.handleSaveAttemptAnswers,
)
quizzesRouter.post(
  '/attempts/:attemptId/submit',
  validateRequest({
    params: attemptIdParamsSchema,
    body: submitAttemptSchema,
  }),
  quizzesController.handleSubmitAttempt,
)
quizzesRouter.get(
  '/:moduleId',
  validateRequest({ params: quizModuleParamsSchema }),
  quizzesController.handleGetQuizDetail,
)
quizzesRouter.post(
  '/:moduleId/attempts',
  validateRequest({ params: quizModuleParamsSchema }),
  quizzesController.handleStartAttempt,
)
