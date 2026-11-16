import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as gradesService from './grades.service.js'

export async function handleGetGradesOverview(
  req: Request,
  res: Response,
): Promise<void> {
  const query = (req.validated?.query ?? {}) as { search?: string }
  const result = await gradesService.getGradesOverview(req.auth!.userId, query)
  sendSuccess(res, result)
}

export async function handleGetCourseGrades(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const result = await gradesService.getCourseGradebook(
    req.auth!.userId,
    req.auth!.role,
    id,
  )
  sendSuccess(res, result)
}
