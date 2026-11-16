import { Router } from 'express'
import { optionalAuth } from '../../middleware/auth.js'
import { sendSuccess } from '../../utils/response.js'
import { getNavigationMenus } from './navigation.service.js'

export const navigationRouter = Router()

navigationRouter.get('/menus', optionalAuth, async (req, res) => {
  const userRole = req.auth?.role ?? 'guest'
  const menus = await getNavigationMenus(userRole)
  sendSuccess(res, menus)
})
