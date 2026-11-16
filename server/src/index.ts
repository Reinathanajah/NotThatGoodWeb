import { env } from './config/env.js'
import { pool } from './db/index.js'
import { createApp } from './app.js'

const app = createApp()

const server = app.listen(env.BACKEND_PORT, () => {
  console.log(`SilverFour REST API listening on http://localhost:${env.BACKEND_PORT}/api/v1`)
})

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down API server...`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
