import { Router } from 'express'
import { optionalAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import * as categoriesController from './categories.controller.js'
import {
  categoryCoursesQuerySchema,
  categoryIdParamsSchema,
  categoryListQuerySchema,
} from './categories.schemas.js'

export const categoriesRouter = Router()

categoriesRouter.get(
  '/',
  validateRequest({ query: categoryListQuerySchema }),
  categoriesController.handleListCategories,
)
categoriesRouter.get(
  '/:id',
  validateRequest({ params: categoryIdParamsSchema }),
  categoriesController.handleGetCategoryDetail,
)
categoriesRouter.get(
  '/:id/courses',
  optionalAuth,
  validateRequest({
    params: categoryIdParamsSchema,
    query: categoryCoursesQuerySchema,
  }),
  categoriesController.handleListCategoryCourses,
)
