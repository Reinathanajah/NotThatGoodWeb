import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as coursesController from './courses.controller.js'
import * as gradesController from '../grades/grades.controller.js'
import {
  courseIdParamsSchema,
  courseModuleParamsSchema,
  myCoursesQuerySchema,
  recentCoursesQuerySchema,
  updateCoursePreferenceSchema,
} from './courses.schemas.js'

export const coursesRouter = Router()

coursesRouter.use(requireAuth)

coursesRouter.get(
  '/my',
  validateRequest({ query: myCoursesQuerySchema }),
  coursesController.handleListMyCourses,
)
coursesRouter.get(
  '/recent',
  validateRequest({ query: recentCoursesQuerySchema }),
  coursesController.handleListRecentCourses,
)
coursesRouter.get(
  '/:id',
  validateRequest({ params: courseIdParamsSchema }),
  coursesController.handleGetCourseDetail,
)
coursesRouter.get(
  '/:id/sections',
  validateRequest({ params: courseIdParamsSchema }),
  coursesController.handleGetCourseSections,
)
coursesRouter.get(
  '/:id/grades',
  validateRequest({ params: courseIdParamsSchema }),
  gradesController.handleGetCourseGrades,
)
coursesRouter.post(
  '/:id/modules/:moduleId/complete',
  validateRequest({ params: courseModuleParamsSchema }),
  coursesController.handleCompleteModule,
)
coursesRouter.delete(
  '/:id/modules/:moduleId/complete',
  validateRequest({ params: courseModuleParamsSchema }),
  coursesController.handleUncompleteModule,
)
coursesRouter.patch(
  '/:id/preference',
  validateRequest({
    params: courseIdParamsSchema,
    body: updateCoursePreferenceSchema,
  }),
  coursesController.handleUpdateCoursePreference,
)
coursesRouter.post(
  '/:id/access',
  validateRequest({ params: courseIdParamsSchema }),
  coursesController.handleRecordCourseAccess,
)
