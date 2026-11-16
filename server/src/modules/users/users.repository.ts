import { eq, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  categories,
  fileObjects,
  privateFiles,
  userPreferences,
  users,
} from '../../db/schema.js'

export async function findUserBaseProfile(userId: string) {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      studentIdNumber: users.studentIdNumber,
      facultyCategoryId: users.facultyCategoryId,
      programCategoryId: users.programCategoryId,
      emailVisibility: users.emailVisibility,
      country: users.country,
      city: users.city,
      timezone: users.timezone,
      preferredLang: users.preferredLang,
      privateFilesQuotaBytes: users.privateFilesQuotaBytes,
      firstAccessAt: users.firstAccessAt,
      lastAccessAt: users.lastAccessAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return row ?? null
}

export async function findCategorySummary(categoryId: number | null) {
  if (!categoryId) return null
  const [row] = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1)
  return row ?? null
}

export async function findUserPreferencesRow(userId: string) {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)
  return row ?? null
}

export async function findPrivateStorageUsageBytes(userId: string): Promise<number> {
  const [usage] = await db
    .select({
      usedBytes: sql<number>`coalesce(sum(${fileObjects.sizeBytes}), 0)::bigint`,
    })
    .from(privateFiles)
    .innerJoin(fileObjects, eq(privateFiles.fileObjectId, fileObjects.id))
    .where(eq(privateFiles.userId, userId))

  return Number(usage?.usedBytes ?? 0)
}
