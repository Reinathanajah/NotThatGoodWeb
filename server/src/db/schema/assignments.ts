import {
  bigint,
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { courseModules } from './courses.js'
import { gradingStatusEnum, plagiarismStatusEnum, submissionStatusEnum } from './enums.js'
import { fileObjects } from './files.js'
import { users } from './users.js'

export const assignments = pgTable('assignments', {
  moduleId: integer('module_id')
    .primaryKey()
    .references(() => courseModules.id, { onDelete: 'cascade' }),
  opensAt: timestamp('opens_at', { withTimezone: true }),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  cutoffAt: timestamp('cutoff_at', { withTimezone: true }),
  maxFiles: integer('max_files').notNull().default(10),
  maxFileSizeBytes: bigint('max_file_size_bytes', { mode: 'number' })
    .notNull()
    .default(104_857_600),
  requireSubmissionStatement: boolean('require_submission_statement').notNull().default(true),
  submissionStatementText: text('submission_statement_text'),
  plagiarismProvider: varchar('plagiarism_provider', { length: 32 }),
  maxAttempts: integer('max_attempts').notNull().default(1),
  maxGrade: numeric('max_grade', { precision: 6, scale: 2 }).notNull().default('100.00'),
})

export const assignmentSubmissions = pgTable(
  'assignment_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assignmentModuleId: integer('assignment_module_id')
      .notNull()
      .references(() => assignments.moduleId, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull().default(1),
    status: submissionStatusEnum('status').notNull().default('none'),
    gradingStatus: gradingStatusEnum('grading_status').notNull().default('not_graded'),
    onlineText: text('online_text'),
    declarationAccepted: boolean('declaration_accepted').notNull().default(false),
    declarationAcceptedAt: timestamp('declaration_accepted_at', { withTimezone: true }),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    lastModifiedAt: timestamp('last_modified_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('assign_sub_module_user_attempt_uidx').on(
      table.assignmentModuleId,
      table.userId,
      table.attemptNumber,
    ),
  ],
)

export const assignmentSubmissionFiles = pgTable(
  'assignment_submission_files',
  {
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => assignmentSubmissions.id, { onDelete: 'cascade' }),
    fileObjectId: uuid('file_object_id')
      .notNull()
      .references(() => fileObjects.id, { onDelete: 'cascade' }),
    attachedAt: timestamp('attached_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.submissionId, table.fileObjectId] })],
)

export const submissionComments = pgTable('submission_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => assignmentSubmissions.id, { onDelete: 'cascade' }),
  authorUserId: uuid('author_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const plagiarismJobs = pgTable('plagiarism_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => assignmentSubmissions.id, { onDelete: 'cascade' }),
  fileObjectId: uuid('file_object_id')
    .notNull()
    .references(() => fileObjects.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 32 }).notNull().default('compilatio'),
  externalDocumentId: varchar('external_document_id', { length: 128 }),
  status: plagiarismStatusEnum('status').notNull().default('pending'),
  similarityPercent: numeric('similarity_percent', { precision: 5, scale: 2 }),
  reportUrl: text('report_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
