import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { courseFormatEnum, enrollmentRoleEnum, moduleTypeEnum } from './enums.js'
import { academicTerms, categories } from './taxonomy.js'
import { users } from './users.js'

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  moodleCourseId: integer('moodle_course_id').unique(),
  code: varchar('code', { length: 64 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  shortName: varchar('short_name', { length: 120 }).notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  termId: integer('term_id').references(() => academicTerms.id, {
    onDelete: 'set null',
  }),
  format: courseFormatEnum('format').notNull().default('topics'),
  summaryHtml: text('summary_html'),
  coverStyle: jsonb('cover_style')
    .$type<{ pattern: string; colorHex: string; accentHex: string }>()
    .notNull()
    .default({ pattern: 'grid', colorHex: '#1f2937', accentHex: '#eab308' }),
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt: timestamp('end_at', { withTimezone: true }),
  visible: boolean('visible').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const enrollments = pgTable(
  'enrollments',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    role: enrollmentRoleEnum('role').notNull().default('student'),
    isStarred: boolean('is_starred').notNull().default(false),
    isHidden: boolean('is_hidden').notNull().default(false),
    cachedFinalGrade: numeric('cached_final_grade', { precision: 6, scale: 2 }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('enrollments_user_course_uidx').on(table.userId, table.courseId)],
)

export const courseAccessLogs = pgTable(
  'course_access_logs',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseId] })],
)

export const courseGroups = pgTable('course_groups', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
})

export const courseGroupMembers = pgTable(
  'course_group_members',
  {
    groupId: integer('group_id')
      .notNull()
      .references(() => courseGroups.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })],
)

export const courseSections = pgTable('course_sections', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  summaryText: text('summary_text'),
  position: integer('position').notNull().default(0),
  isCollapsedDefault: boolean('is_collapsed_default').notNull().default(false),
  weekStart: timestamp('week_start', { withTimezone: true }),
  weekEnd: timestamp('week_end', { withTimezone: true }),
  visible: boolean('visible').notNull().default(true),
})

export const courseModules = pgTable('course_modules', {
  id: serial('id').primaryKey(),
  moodleModuleId: integer('moodle_module_id').unique(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  sectionId: integer('section_id')
    .notNull()
    .references(() => courseSections.id, { onDelete: 'cascade' }),
  moduleType: moduleTypeEnum('module_type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  subsectionLabel: varchar('subsection_label', { length: 120 }),
  descriptionHtml: text('description_html'),
  externalUrl: text('external_url'),
  position: integer('position').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  completionTrackable: boolean('completion_trackable').notNull().default(true),
  opensAt: timestamp('opens_at', { withTimezone: true }),
  dueOrClosedAt: timestamp('due_or_closed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const moduleCompletions = pgTable(
  'module_completions',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: integer('module_id')
      .notNull()
      .references(() => courseModules.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.moduleId] })],
)
