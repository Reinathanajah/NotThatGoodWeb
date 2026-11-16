import type { Response } from 'express'

export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
  statusCode = 200,
): void {
  res.status(statusCode).json({
    ok: true,
    data,
    ...(meta ? { meta } : {}),
  })
}

export function sendCreated<T>(
  res: Response,
  data: T,
  meta?: Record<string, unknown>,
): void {
  sendSuccess(res, data, meta, 201)
}

export function sendFileBuffer(
  res: Response,
  options: {
    filename: string
    mimeType: string
    buffer: Buffer
    disposition: 'attachment' | 'inline'
    isSeededStub?: boolean
  },
): void {
  const safeFilename = options.filename.replace(/["\\\r\n]/g, '_')
  res.setHeader('Content-Type', options.mimeType)
  res.setHeader(
    'Content-Disposition',
    `${options.disposition}; filename="${safeFilename}"`,
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (options.mimeType === 'text/html') {
    res.setHeader('Content-Security-Policy', 'sandbox allow-scripts')
  }
  if (options.isSeededStub) {
    res.setHeader('X-Content-Fallback', 'seeded-placeholder')
  }
  res.status(200).send(options.buffer)
}
