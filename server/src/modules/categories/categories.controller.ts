import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as categoriesService from './categories.service.js'

export async function handleListCategories(req: Request, res: Response): Promise<void> {
  const { view, depth, parentId } = req.validated!.query as {
    view: 'tree' | 'flat'
    depth?: number
    parentId?: number
  }
  const result = await categoriesService.listCategories({ view, depth, parentId })
  sendSuccess(res, result)
}

export async function handleGetCategoryDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const result = await categoriesService.getCategoryDetail(id)
  sendSuccess(res, result)
}

export async function handleListCategoryCourses(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const { includeSubcategories, search, page, limit } = req.validated!.query as {
    includeSubcategories: boolean
    search?: string
    page: number
    limit: number
  }
  const result = await categoriesService.listCategoryCourses(id, {
    includeSubcategories,
    search,
    page,
    limit,
    userId: req.auth?.userId,
  })
  sendSuccess(res, result.items, {
    category: result.category,
    pagination: result.meta,
  })
}
