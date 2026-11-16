import { Router } from 'express'
import { env } from '../../config/env.js'
import { checkDatabaseHealth } from '../../db/index.js'
import { sendSuccess } from '../../utils/response.js'

export const healthRouter = Router()

healthRouter.get('/', async (_req, res) => {
  const dbHealth = await checkDatabaseHealth()
  sendSuccess(res, {
    service: 'silverfour-lms-api',
    wave: 10,
    activeWaves: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    environment: env.NODE_ENV,
    database: dbHealth,
    utcTime: new Date().toISOString(),
  })
})
