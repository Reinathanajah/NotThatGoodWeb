import type { Request, Response } from 'express'
import { sendSuccess } from '../../utils/response.js'
import * as coursesService from './courses.service.js'

export async function handleListMyCourses(req: Request, res: Response): Promise<void> {
  const { filter, search, sort, page, limit } = req.validated!.query as {
    filter: coursesService.CourseOverviewFilter
    search?: string
    sort: coursesService.CourseOverviewSort
    page: number
    limit: number
  }
  const result = await coursesService.listMyCourses(req.auth!.userId, {
    filter,
    search,
    sort,
    page,
    limit,
  })
  sendSuccess(res, result.items, { pagination: result.meta })
}

export async function handleUpdateCoursePreference(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const patch = req.validated!.body as { isStarred?: boolean; isHidden?: boolean }
  const updated = await coursesService.updateCoursePreference(
    req.auth!.userId,
    id,
    patch,
  )
  sendSuccess(res, updated)
}

export async function handleListRecentCourses(req: Request, res: Response): Promise<void> {
  const { limit } = req.validated!.query as { limit: number }
  const items = await coursesService.listRecentCourses(req.auth!.userId, limit)
  sendSuccess(res, items)
}

export async function handleRecordCourseAccess(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const result = await coursesService.recordCourseAccess(req.auth!.userId, id)
  sendSuccess(res, result)
}

export async function handleGetCourseDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const detail = await coursesService.getCourseDetail(req.auth!.userId, id)
  sendSuccess(res, detail)
}

export async function handleGetCourseSections(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as { id: number }
  const result = await coursesService.getCourseSections(req.auth!.userId, id)
  sendSuccess(res, result.sections, { course: result.course })
}

export async function handleCompleteModule(req: Request, res: Response): Promise<void> {
  const { id, moduleId } = req.validated!.params as { id: number; moduleId: number }
  const result = await coursesService.setModuleCompletion(
    req.auth!.userId,
    id,
    moduleId,
    true,
  )
  sendSuccess(res, result)
}

export async function handleUncompleteModule(req: Request, res: Response): Promise<void> {
  const { id, moduleId } = req.validated!.params as { id: number; moduleId: number }
  const result = await coursesService.setModuleCompletion(
    req.auth!.userId,
    id,
    moduleId,
    false,
  )
  sendSuccess(res, result)
}
