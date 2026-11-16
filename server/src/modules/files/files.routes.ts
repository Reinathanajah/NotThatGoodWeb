import { Router } from 'express'
import multer from 'multer'
import { env } from '../../config/env.js'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as filesController from './files.controller.js'
import {
  createFolderSchema,
  fileDownloadQuerySchema,
  fileIdParamsSchema,
  privateFilesQuerySchema,
} from './files.schemas.js'

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
})

export const filesRouter = Router()

filesRouter.use(requireAuth)

filesRouter.get(
  '/private',
  validateRequest({ query: privateFilesQuerySchema }),
  filesController.handleListPrivateFiles,
)
filesRouter.post(
  '/private/folders',
  validateRequest({ body: createFolderSchema }),
  filesController.handleCreatePrivateFolder,
)
filesRouter.post(
  '/upload',
  uploadMiddleware.single('file'),
  filesController.handleUploadFile,
)
filesRouter.delete(
  '/:fileId',
  validateRequest({ params: fileIdParamsSchema }),
  filesController.handleDeleteFile,
)
filesRouter.get(
  '/:fileId/download',
  validateRequest({
    params: fileIdParamsSchema,
    query: fileDownloadQuerySchema,
  }),
  filesController.handleDownloadFile,
)
