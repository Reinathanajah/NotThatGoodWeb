import type { Request, Response } from 'express'
import { sendCreated, sendSuccess } from '../../utils/response.js'
import * as calendarService from './calendar.service.js'

export async function handleListEvents(req: Request, res: Response): Promise<void> {
  const query = req.validated!.query as {
    view: 'month' | 'day' | 'upcoming'
    year?: number
    month?: number
    day?: number
    courseId?: number
    includeHiddenScopes: boolean
  }
  const result = await calendarService.listCalendarEvents(req.auth!.userId, query)
  sendSuccess(res, result)
}

export async function handleCreateEvent(req: Request, res: Response): Promise<void> {
  const body = req.validated!.body as {
    title: string
    description?: string | null
    scope: 'site' | 'category' | 'course' | 'group' | 'user' | 'other'
    courseId?: number
    categoryId?: number
    groupId?: number
    startAt: string
    endAt?: string | null
  }
  const created = await calendarService.createCalendarEvent(
    req.auth!.userId,
    req.auth!.role,
    body,
  )
  sendCreated(res, created)
}

export async function handleDeleteEvent(req: Request, res: Response): Promise<void> {
  const { id } = req.validated!.params as { id: string }
  const deleted = await calendarService.deleteCalendarEvent(
    req.auth!.userId,
    req.auth!.role,
    id,
  )
  sendSuccess(res, deleted)
}
