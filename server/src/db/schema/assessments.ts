import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { courseModules, courses } from './courses.js'
import { users } from './users.js'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  points: number
  tag?: string
}

export const quizzes = pgTable('quizzes', {
  moduleId: integer('module_id')
    .primaryKey()
    .references(() => courseModules.id, { onDelete: 'cascade' }),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }).notNull(),
  timeLimitSeconds: integer('time_limit_seconds'),
  maxAttempts: integer('max_attempts').notNull().default(1),
  maxGrade: numeric('max_grade', { precision: 6, scale: 2 }).notNull().default('100.00'),
  questionsJson: jsonb('questions_json').$type<QuizQuestion[]>().notNull().default([]),
})

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizModuleId: integer('quiz_module_id')
    .notNull()
    .references(() => quizzes.moduleId, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  attemptNumber: integer('attempt_number').notNull().default(1),
  status: varchar('status', { length: 24 }).notNull().default('in_progress'),
  answersJson: jsonb('answers_json').$type<Record<string, number>>().notNull().default({}),
  score: numeric('score', { precision: 6, scale: 2 }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
})

export const gradeItems = pgTable('grade_items', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  moduleId: integer('module_id').references(() => courseModules.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 255 }).notNull(),
  maxGrade: numeric('max_grade', { precision: 6, scale: 2 }).notNull().default('100.00'),
  weight: numeric('weight', { precision: 5, scale: 2 }).notNull().default('1.00'),
  isHiddenFromStudents: boolean('is_hidden_from_students').notNull().default(false),
})

export const grades = pgTable(
  'grades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gradeItemId: integer('grade_item_id')
      .notNull()
      .references(() => gradeItems.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    graderUserId: uuid('grader_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    score: numeric('score', { precision: 6, scale: 2 }),
    feedback: text('feedback'),
    gradedAt: timestamp('graded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('grades_item_user_uidx').on(table.gradeItemId, table.userId)],
)
