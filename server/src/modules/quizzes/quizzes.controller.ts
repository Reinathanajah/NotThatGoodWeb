import type { Request, Response } from 'express'
import { sendCreated, sendSuccess } from '../../utils/response.js'
import * as quizzesService from './quizzes.service.js'

export async function handleGetQuizDetail(req: Request, res: Response): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const detail = await quizzesService.getQuizDetail(req.auth!.userId, moduleId)
  sendSuccess(res, detail)
}

export async function handleStartAttempt(req: Request, res: Response): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const attempt = await quizzesService.startOrResumeQuizAttempt(
    req.auth!.userId,
    moduleId,
  )
  sendCreated(res, attempt)
}

export async function handleSaveAttemptAnswers(
  req: Request,
  res: Response,
): Promise<void> {
  const { attemptId } = req.validated!.params as { attemptId: string }
  const { answers } = req.validated!.body as { answers: Record<string, number> }
  const updated = await quizzesService.saveAttemptAnswers(
    req.auth!.userId,
    attemptId,
    answers,
  )
  sendSuccess(res, updated)
}

export async function handleSubmitAttempt(req: Request, res: Response): Promise<void> {
  const { attemptId } = req.validated!.params as { attemptId: string }
  const { answers } = req.validated!.body as { answers?: Record<string, number> }
  const result = await quizzesService.submitQuizAttempt(
    req.auth!.userId,
    attemptId,
    answers,
  )
  sendSuccess(res, result)
}
