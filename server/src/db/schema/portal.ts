import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { supportTicketStatusEnum } from './enums.js'
import { categories } from './taxonomy.js'
import { users } from './users.js'

export const navigationItems = pgTable('navigation_items', {
  id: serial('id').primaryKey(),
  menuGroup: varchar('menu_group', { length: 64 }).notNull(),
  parentId: integer('parent_id').references((): AnyPgColumn => navigationItems.id, {
    onDelete: 'cascade',
  }),
  label: varchar('label', { length: 160 }).notNull(),
  href: text('href').notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  targetRole: varchar('target_role', { length: 32 }).notNull().default('all'),
  isExternal: boolean('is_external').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const staticPages = pgTable('static_pages', {
  slug: varchar('slug', { length: 64 }).primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  contentMarkdown: text('content_markdown').notNull(),
  linksJson: jsonb('links_json')
    .$type<Array<{ label: string; href: string; isExternal?: boolean }>>()
    .notNull()
    .default([]),
  isPublic: boolean('is_public').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const learnerScriptReports = pgTable('learner_script_reports', {
  key: varchar('key', { length: 64 }).primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  reportType: varchar('report_type', { length: 64 }).notNull(),
  configJson: jsonb('config_json').$type<Record<string, unknown>>().notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
})

export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: supportTicketStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
