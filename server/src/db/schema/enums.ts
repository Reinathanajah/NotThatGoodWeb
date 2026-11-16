import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['student', 'lecturer', 'admin'])

export const emailVisibilityEnum = pgEnum('email_visibility', [
  'hidden',
  'course_participants',
  'everyone',
])

export const langEnum = pgEnum('lang_code', ['en', 'id', 'zh_cn'])

export const enrollmentRoleEnum = pgEnum('enrollment_role', ['student', 'lecturer', 'ta'])

export const courseFormatEnum = pgEnum('course_format', ['topics', 'weeks'])

export const moduleTypeEnum = pgEnum('module_type', [
  'assign',
  'quiz',
  'resource',
  'label',
  'url',
])

export const submissionStatusEnum = pgEnum('submission_status', [
  'none',
  'draft',
  'submitted',
])

export const gradingStatusEnum = pgEnum('grading_status', ['not_graded', 'graded'])

export const plagiarismStatusEnum = pgEnum('plagiarism_status', [
  'pending',
  'scanning',
  'completed',
  'failed',
])

export const calendarScopeEnum = pgEnum('calendar_scope', [
  'site',
  'category',
  'course',
  'group',
  'user',
  'other',
])

export const fileLicenseEnum = pgEnum('file_license', [
  'all_rights_reserved',
  'cc_by',
  'cc_by_sa',
  'public_domain',
])

export const supportTicketStatusEnum = pgEnum('support_ticket_status', [
  'open',
  'pending',
  'resolved',
])
