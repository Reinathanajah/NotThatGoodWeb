import { z } from 'zod'
import { isValidIanaTimezone } from '../../utils/timezone.js'

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(200).optional(),
    emailVisibility: z.enum(['hidden', 'course_participants', 'everyone']).optional(),
    country: z.string().trim().min(2).max(100).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    timezone: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .refine(isValidIanaTimezone, 'Invalid IANA timezone')
      .optional(),
    preferredLang: z.enum(['en', 'id', 'zh_cn']).optional(),
  })
  .refine(
    (payload) => Object.values(payload).some((val) => val !== undefined),
    'At least one profile field is required',
  )

export const updatePreferencesSchema = z
  .object({
    editMode: z.boolean().optional(),
    courseOverviewFilter: z
      .enum(['all', 'in_progress', 'future', 'past', 'starred', 'hidden'])
      .optional(),
    courseOverviewSort: z.enum(['name', 'last_accessed']).optional(),
    courseOverviewView: z.enum(['list', 'card', 'summary']).optional(),
    courseOverviewPageSize: z
      .union([z.literal(12), z.literal(24), z.literal(48), z.literal(0)])
      .optional(),
    calendarHiddenScopes: z
      .array(z.enum(['site', 'category', 'course', 'group', 'user', 'other']))
      .optional(),
    resetToDefault: z.boolean().optional(),
  })
  .refine(
    (payload) => Object.values(payload).some((val) => val !== undefined),
    'At least one preference field is required',
  )
