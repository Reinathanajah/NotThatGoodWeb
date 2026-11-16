import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { assignmentsRouter } from './modules/assignments/assignments.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { calendarRouter } from './modules/calendar/calendar.routes.js'
import { categoriesRouter } from './modules/categories/categories.routes.js'
import { clockRouter } from './modules/clock/clock.routes.js'
import { coursesRouter } from './modules/courses/courses.routes.js'
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js'
import { filePickerRouter } from './modules/filePicker/filePicker.routes.js'
import { filesRouter } from './modules/files/files.routes.js'
import { gradesRouter } from './modules/grades/grades.routes.js'
import { healthRouter } from './modules/health/health.routes.js'
import { i18nRouter } from './modules/i18n/i18n.routes.js'
import { messagesRouter } from './modules/messages/messages.routes.js'
import { navigationRouter } from './modules/navigation/navigation.routes.js'
import { notificationsRouter } from './modules/notifications/notifications.routes.js'
import { presenceRouter } from './modules/presence/presence.routes.js'
import { quizzesRouter } from './modules/quizzes/quizzes.routes.js'
import { reportsRouter } from './modules/reports/reports.routes.js'
import { resourcesRouter } from './modules/resources/resources.routes.js'
import { searchRouter } from './modules/search/search.routes.js'
import { staticPagesRouter } from './modules/staticPages/staticPages.routes.js'
import { supportRouter } from './modules/support/support.routes.js'
import { usersRouter } from './modules/users/users.routes.js'

function resolveAllowedCorsOrigins(): Set<string> {
  const origins = new Set(
    env.CORS_ORIGIN.split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )
  for (const host of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (host) origins.add(`https://${host.trim()}`)
  }
  return origins
}

export function createApp() {
  const app = express()
  const allowedOrigins = resolveAllowedCorsOrigins()

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true)
          return
        }
        callback(null, false)
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use('/api/v1/health', healthRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/i18n', i18nRouter)
  app.use('/api/v1/presence', presenceRouter)
  app.use('/api/v1/categories', categoriesRouter)
  app.use('/api/v1/navigation', navigationRouter)
  app.use('/api/v1/search', searchRouter)
  app.use('/api/v1/dashboard', dashboardRouter)
  app.use('/api/v1/courses', coursesRouter)
  app.use('/api/v1/resources', resourcesRouter)
  app.use('/api/v1/assignments', assignmentsRouter)
  app.use('/api/v1/quizzes', quizzesRouter)
  app.use('/api/v1/files', filesRouter)
  app.use('/api/v1/file-picker', filePickerRouter)
  app.use('/api/v1/calendar', calendarRouter)
  app.use('/api/v1/notifications', notificationsRouter)
  app.use('/api/v1/messages', messagesRouter)
  app.use('/api/v1/grades', gradesRouter)
  app.use('/api/v1/reports', reportsRouter)
  app.use('/api/v1/static-pages', staticPagesRouter)
  app.use('/api/v1/support', supportRouter)
  app.use('/api/v1/clock', clockRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
