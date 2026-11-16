import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as reportsService from './reports.service.js'

export async function handleListLearnerScriptReports(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await reportsService.listLearnerScriptReports(
    req.auth!.userId,
    req.auth!.role,
  )
  sendSuccess(res, result)
}

export async function handleGetLearnerScriptReport(
  req: Request,
  res: Response,
): Promise<void> {
  const { key } = req.validated!.params as { key: string }
  const query = (req.validated?.query ?? {}) as { courseId?: number }
  const result = await reportsService.getLearnerScriptReportByKey(
    req.auth!.userId,
    req.auth!.role,
    key,
    query,
  )
  sendSuccess(res, result)
}
