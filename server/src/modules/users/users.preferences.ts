import { db } from '../../db/index.js'
import { userPreferences } from '../../db/schema.js'
import { findUserPreferencesRow } from './users.repository.js'

export interface UserPreferencesDto {
  editMode: boolean
  courseOverviewFilter: string
  courseOverviewSort: string
  courseOverviewView: string
  courseOverviewPageSize: number
  calendarHiddenScopes: string[]
}

export const DEFAULT_USER_PREFERENCES: UserPreferencesDto = {
  editMode: false,
  courseOverviewFilter: 'all',
  courseOverviewSort: 'name',
  courseOverviewView: 'list',
  courseOverviewPageSize: 12,
  calendarHiddenScopes: [],
}

export interface UpdatePreferencesInput {
  editMode?: boolean
  courseOverviewFilter?: string
  courseOverviewSort?: string
  courseOverviewView?: string
  courseOverviewPageSize?: number
  calendarHiddenScopes?: string[]
  resetToDefault?: boolean
}

export function mapPreferencesRow(row?: typeof userPreferences.$inferSelect | null): UserPreferencesDto {
  if (!row) return DEFAULT_USER_PREFERENCES
  return {
    editMode: row.editMode,
    courseOverviewFilter: row.courseOverviewFilter,
    courseOverviewSort: row.courseOverviewSort,
    courseOverviewView: row.courseOverviewView,
    courseOverviewPageSize: row.courseOverviewPageSize,
    calendarHiddenScopes: row.calendarHiddenScopes,
  }
}

export async function updateUserPreferences(
  userId: string,
  input: UpdatePreferencesInput,
): Promise<UserPreferencesDto> {
  const now = new Date()
  const base = input.resetToDefault
    ? DEFAULT_USER_PREFERENCES
    : mapPreferencesRow(await findUserPreferencesRow(userId))

  const nextPrefs: UserPreferencesDto = input.resetToDefault
    ? DEFAULT_USER_PREFERENCES
    : {
        editMode: input.editMode ?? base.editMode,
        courseOverviewFilter: input.courseOverviewFilter ?? base.courseOverviewFilter,
        courseOverviewSort: input.courseOverviewSort ?? base.courseOverviewSort,
        courseOverviewView: input.courseOverviewView ?? base.courseOverviewView,
        courseOverviewPageSize: input.courseOverviewPageSize ?? base.courseOverviewPageSize,
        calendarHiddenScopes:
          input.calendarHiddenScopes !== undefined
            ? [...new Set(input.calendarHiddenScopes)]
            : base.calendarHiddenScopes,
      }

  const [saved] = await db
    .insert(userPreferences)
    .values({ userId, ...nextPrefs, updatedAt: now })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { ...nextPrefs, updatedAt: now },
    })
    .returning()

  return mapPreferencesRow(saved)
}
