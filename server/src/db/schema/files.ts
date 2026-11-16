import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { courseModules } from './courses.js'
import { fileLicenseEnum } from './enums.js'
import { users } from './users.js'

export const fileObjects = pgTable('file_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUserId: uuid('owner_user_id').references(() => users.id, { onDelete: 'set null' }),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 128 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  sha256: varchar('sha256', { length: 64 }),
  storageKey: text('storage_key').notNull(),
  authorName: varchar('author_name', { length: 200 }),
  license: fileLicenseEnum('license').notNull().default('all_rights_reserved'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
})

export const resources = pgTable('resources', {
  moduleId: integer('module_id')
    .primaryKey()
    .references(() => courseModules.id, { onDelete: 'cascade' }),
  fileObjectId: uuid('file_object_id').references(() => fileObjects.id, {
    onDelete: 'set null',
  }),
  resourceKind: varchar('resource_kind', { length: 32 }).notNull().default('pdf'),
  displayMode: varchar('display_mode', { length: 32 }).notNull().default('automatic'),
})

export const privateFiles = pgTable('private_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentFolderId: uuid('parent_folder_id').references((): AnyPgColumn => privateFiles.id, {
    onDelete: 'cascade',
  }),
  isFolder: boolean('is_folder').notNull().default(false),
  name: varchar('name', { length: 255 }).notNull(),
  fileObjectId: uuid('file_object_id').references(() => fileObjects.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
