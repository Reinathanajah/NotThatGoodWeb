import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'
import { BadRequestError } from '../utils/errors.js'

interface ValidationSchemas {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

export interface ValidatedRequestData {
  body?: unknown
  query?: unknown
  params?: unknown
}

declare global {
  namespace Express {
    interface Request {
      validated?: ValidatedRequestData
    }
  }
}

function parsePart(
  prefix: 'params' | 'query' | 'body',
  schema: ZodTypeAny | undefined,
  rawValue: unknown,
  details: Array<{ field: string; message: string }>,
): unknown {
  if (!schema) return undefined
  const result = schema.safeParse(rawValue)
  if (!result.success) {
    for (const issue of result.error.issues) {
      details.push({
        field: [prefix, ...issue.path].join('.'),
        message: issue.message,
      })
    }
    return undefined
  }
  return result.data
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const details: Array<{ field: string; message: string }> = []
    const validated: ValidatedRequestData = {}

    const paramsData = parsePart('params', schemas.params, req.params, details)
    if (paramsData !== undefined) {
      validated.params = paramsData
      req.params = paramsData as Request['params']
    }

    const queryData = parsePart('query', schemas.query, req.query, details)
    if (queryData !== undefined) {
      validated.query = queryData
    }

    const bodyData = parsePart('body', schemas.body, req.body, details)
    if (bodyData !== undefined) {
      validated.body = bodyData
      req.body = bodyData
    }

    if (details.length > 0) {
      next(new BadRequestError('Validation failed', details))
      return
    }

    req.validated = validated
    next()
  }
}
