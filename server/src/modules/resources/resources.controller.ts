import type { Request, Response } from 'express'
import { sendFileBuffer, sendSuccess } from '../../utils/response.js'
import * as resourcesService from './resources.service.js'

export async function handleGetResourceDetail(req: Request, res: Response): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const detail = await resourcesService.getResourceDetail(req.auth!.userId, moduleId)
  sendSuccess(res, detail)
}

export async function handleDownloadResource(req: Request, res: Response): Promise<void> {
  const { moduleId } = req.validated!.params as { moduleId: number }
  const { disposition } = req.validated!.query as {
    disposition: 'attachment' | 'inline'
  }

  const { file, buffer, isSeededStub } =
    await resourcesService.getResourceDownloadPayload(req.auth!.userId, moduleId)

  sendFileBuffer(res, {
    filename: file.originalName,
    mimeType: file.mimeType,
    buffer,
    disposition,
    isSeededStub,
  })
}
