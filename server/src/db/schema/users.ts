import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { emailVisibilityEnum, langEnum, userRoleEnum } from './enums.js'
import { categories } from './taxonomy.js'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  role: userRoleEnum('role').notNull().default('student'),
  studentIdNumber: varchar('student_id_number', { length: 40 }),
  facultyCategoryId: integer('faculty_category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  programCategoryId: integer('program_category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  emailVisibility: emailVisibilityEnum('email_visibility')
    .notNull()
    .default('course_participants'),
  country: varchar('country', { length: 100 }).notNull().default('Global'),
  city: varchar('city', { length: 100 }).notNull().default('Main Campus'),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  preferredLang: langEnum('preferred_lang').notNull().default('en'),
  privateFilesQuotaBytes: bigint('private_files_quota_bytes', { mode: 'number' })
    .notNull()
    .default(2_147_483_648),
  firstAccessAt: timestamp('first_access_at', { withTimezone: true }),
  lastAccessAt: timestamp('last_access_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  editMode: boolean('edit_mode').notNull().default(false),
  courseOverviewFilter: varchar('course_overview_filter', { length: 32 })
    .notNull()
    .default('all'),
  courseOverviewSort: varchar('course_overview_sort', { length: 32 })
    .notNull()
    .default('name'),
  courseOverviewView: varchar('course_overview_view', { length: 32 })
    .notNull()
    .default('list'),
  courseOverviewPageSize: integer('course_overview_page_size').notNull().default(12),
  calendarHiddenScopes: jsonb('calendar_hidden_scopes')
    .$type<string[]>()
    .notNull()
    .default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const browserSessions = pgTable('browser_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenJti: varchar('token_jti', { length: 128 }).notNull().unique(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 64 }),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const mobileQrTokens = pgTable('mobile_qr_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const presenceHeartbeats = pgTable('presence_heartbeats', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
})
