import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  moodleCategoryId: integer('moodle_category_id').unique(),
  parentId: integer('parent_id').references((): AnyPgColumn => categories.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  path: varchar('path', { length: 255 }).notNull(),
  depth: integer('depth').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const academicTerms = pgTable('academic_terms', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  label: varchar('label', { length: 120 }).notNull(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
})
