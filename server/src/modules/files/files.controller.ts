import type { Request, Response } from 'express'
import { BadRequestError } from '../../utils/errors.js'
import { sendCreated, sendFileBuffer, sendSuccess } from '../../utils/response.js'
import { uploadBodySchema } from './files.schemas.js'
import * as filesService from './files.service.js'

export async function handleListPrivateFiles(req: Request, res: Response): Promise<void> {
  const { folderId, view } = req.validated!.query as {
    folderId?: string
    view: 'grid' | 'list' | 'tree'
  }
  const result = await filesService.listPrivateFiles(req.auth!.userId, {
    folderId,
    view,
  })
  sendSuccess(res, result)
}

export async function handleCreatePrivateFolder(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.validated!.body as {
    name: string
    parentFolderId?: string | null
  }
  const folder = await filesService.createPrivateFolder(req.auth!.userId, input)
  sendCreated(res, folder)
}

export async function handleUploadFile(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new BadRequestError('Multipart form field "file" is required')
  }

  const parsed = uploadBodySchema.safeParse(req.body)
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: ['body', ...issue.path].join('.'),
      message: issue.message,
    }))
    throw new BadRequestError('Validation failed', details)
  }

  const saved = await filesService.saveUploadedFile(req.auth!.userId, req.file, parsed.data)
  sendCreated(res, saved)
}

export async function handleDeleteFile(req: Request, res: Response): Promise<void> {
  const { fileId } = req.validated!.params as { fileId: string }
  const deleted = await filesService.deleteUserFileOrFolder(req.auth!.userId, fileId)
  sendSuccess(res, deleted)
}

export async function handleDownloadFile(req: Request, res: Response): Promise<void> {
  const { fileId } = req.validated!.params as { fileId: string }
  const { disposition } = req.validated!.query as {
    disposition: 'attachment' | 'inline'
  }

  const { file, buffer, isSeededStub } = await filesService.getFileDownloadPayload(
    req.auth!.userId,
    fileId,
  )

  sendFileBuffer(res, {
    filename: file.displayName || file.originalName,
    mimeType: file.mimeType,
    buffer,
    disposition,
    isSeededStub,
  })
}
