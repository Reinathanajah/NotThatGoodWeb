import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL is required for Drizzle Kit.')
}

export default defineConfig({
  schema: './server/src/db/schema/*.ts',
  out: './server/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
})
