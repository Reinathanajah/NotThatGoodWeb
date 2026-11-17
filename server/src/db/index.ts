import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../config/env.js'
import * as schema from './schema.js'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 20_000,
  ssl: env.DATABASE_URL.includes('localhost') ? undefined : { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })

export async function checkDatabaseHealth(): Promise<{ ok: boolean; latencyMs: number; serverTime: string }> {
  const start = performance.now()
  const result = await pool.query<{ now: string }>('SELECT now()::text AS now')
  const latencyMs = Math.round(performance.now() - start)
  return {
    ok: true,
    latencyMs,
    serverTime: result.rows[0]?.now ?? new Date().toISOString(),
  }
}
