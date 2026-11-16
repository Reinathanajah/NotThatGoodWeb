import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { NotFoundError } from '../../utils/errors.js'
import { mapPreferencesRow } from './users.preferences.js'
import {
  findCategorySummary,
  findPrivateStorageUsageBytes,
  findUserBaseProfile,
  findUserPreferencesRow,
} from './users.repository.js'

export {
  DEFAULT_USER_PREFERENCES,
  updateUserPreferences,
  type UpdatePreferencesInput,
  type UserPreferencesDto,
} from './users.preferences.js'

export interface UpdateProfileInput {
  fullName?: string
  emailVisibility?: 'hidden' | 'course_participants' | 'everyone'
  country?: string
  city?: string
  timezone?: string
  preferredLang?: 'en' | 'id' | 'zh_cn'
}

export async function getUserProfileById(userId: string) {
  const row = await findUserBaseProfile(userId)
  if (!row) {
    throw new NotFoundError('User profile not found')
  }

  const [prefs, faculty, program, usedBytes] = await Promise.all([
    findUserPreferencesRow(userId),
    findCategorySummary(row.facultyCategoryId),
    findCategorySummary(row.programCategoryId),
    findPrivateStorageUsageBytes(userId),
  ])

  const nowMs = Date.now()

  return {
    ...row,
    faculty,
    program,
    loginActivity: {
      firstAccessAt: row.firstAccessAt,
      lastAccessAt: row.lastAccessAt,
      accountAgeSeconds: row.firstAccessAt
        ? Math.max(0, Math.floor((nowMs - row.firstAccessAt.getTime()) / 1000))
        : null,
      secondsSinceLastAccess: row.lastAccessAt
        ? Math.max(0, Math.floor((nowMs - row.lastAccessAt.getTime()) / 1000))
        : null,
    },
    storage: {
      quotaBytes: row.privateFilesQuotaBytes,
      usedBytes,
      remainingBytes: Math.max(0, row.privateFilesQuotaBytes - usedBytes),
    },
    preferences: mapPreferencesRow(prefs),
  }
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const updates: Record<string, unknown> = { updatedAt: new Date() }

  if (input.fullName !== undefined) updates.fullName = input.fullName
  if (input.emailVisibility !== undefined) updates.emailVisibility = input.emailVisibility
  if (input.country !== undefined) updates.country = input.country
  if (input.city !== undefined) updates.city = input.city
  if (input.timezone !== undefined) updates.timezone = input.timezone
  if (input.preferredLang !== undefined) updates.preferredLang = input.preferredLang

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning({ id: users.id })

  if (!updated) {
    throw new NotFoundError('User profile not found')
  }

  return getUserProfileById(userId)
}
