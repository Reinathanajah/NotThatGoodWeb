import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as staticPagesService from './staticPages.service.js'

export async function handleGetStaticPage(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = req.validated!.params as { slug: string }
  const page = await staticPagesService.getStaticPageBySlug(
    slug,
    Boolean(req.auth?.userId),
  )

  res.setHeader(
    'Cache-Control',
    page.isPublic ? 'public, max-age=300' : 'private, no-cache',
  )
  sendSuccess(res, page)
}
