import type { Request, Response } from 'express'
import { sendCreated, sendSuccess } from '../../utils/response.js'
import * as assignmentsService from './assignments.service.js'

export async function handleGetAssignmentDetail(
  req: Request,
  res: Response,
): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const detail = await assignmentsService.getAssignmentDetail(
    req.auth!.userId,
    moduleId,
  )
  sendSuccess(res, detail)
}

export async function handleUpsertSubmission(
  req: Request,
  res: Response,
): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const payload = req.validated!.body as {
    action: 'draft' | 'submit'
    onlineText?: string | null
    fileIds: string[]
    declarationAccepted: boolean
  }
  const updated = await assignmentsService.upsertAssignmentSubmission(
    req.auth!.userId,
    moduleId,
    payload,
  )
  sendSuccess(res, updated)
}

export async function handleListComments(req: Request, res: Response): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const comments = await assignmentsService.listSubmissionComments(
    req.auth!.userId,
    moduleId,
  )
  sendSuccess(res, comments)
}

export async function handleAddComment(req: Request, res: Response): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const { body } = req.validated!.body as { body: string }
  const comment = await assignmentsService.addSubmissionComment(
    req.auth!.userId,
    moduleId,
    body,
  )
  sendCreated(res, comment)
}

export async function handleTriggerPlagiarism(
  req: Request,
  res: Response,
): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const result = await assignmentsService.triggerPlagiarismSubmit(
    req.auth!.userId,
    moduleId,
  )
  sendSuccess(res, result)
}

export async function handleGetPlagiarismStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const result = await assignmentsService.getPlagiarismStatus(
    req.auth!.userId,
    moduleId,
  )
  sendSuccess(res, result)
}
