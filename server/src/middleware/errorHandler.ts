import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  })
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    })
    return
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    const code = err.code === 'LIMIT_FILE_SIZE' ? 'PAYLOAD_TOO_LARGE' : 'UPLOAD_ERROR'
    res.status(status).json({
      ok: false,
      error: {
        code,
        message: err.message,
      },
    })
    return
  }

  if (err instanceof SyntaxError && 'status' in err && (err as { status?: unknown }).status === 400) {
    res.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON request body',
      },
    })
    return
  }

  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error'

  if (env.NODE_ENV !== 'test') {
    console.error('[api-error]', err)
  }

  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
    },
  })
}
