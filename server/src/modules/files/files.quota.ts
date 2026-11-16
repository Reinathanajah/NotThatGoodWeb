import { eq, sql } from 'drizzle-orm'
import { env } from '../../config/env.js'
import { db } from '../../db/index.js'
import { fileObjects, privateFiles, users } from '../../db/schema.js'

export type FileLicense =
  | 'all_rights_reserved'
  | 'cc_by'
  | 'cc_by_sa'
  | 'public_domain'

type QueryRunner = Pick<typeof db, 'select'>

export async function getPrivateFilesQuota(
  userId: string,
  runner: QueryRunner = db,
) {
  const [[userRow], [usageRow]] = await Promise.all([
    runner
      .select({
        quotaBytes: users.privateFilesQuotaBytes,
        fullName: users.fullName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    runner
      .select({
        usedBytes: sql<number>`coalesce(sum(${fileObjects.sizeBytes}), 0)::bigint`,
      })
      .from(privateFiles)
      .innerJoin(fileObjects, eq(privateFiles.fileObjectId, fileObjects.id))
      .where(eq(privateFiles.userId, userId)),
  ])

  const quotaBytes = userRow?.quotaBytes ?? env.PRIVATE_FILES_QUOTA_BYTES
  const usedBytes = Number(usageRow?.usedBytes ?? 0)

  return {
    quotaBytes,
    usedBytes,
    remainingBytes: Math.max(0, quotaBytes - usedBytes),
    maxUploadFileBytes: env.MAX_UPLOAD_SIZE_BYTES,
    ownerFullName: userRow?.fullName ?? '',
  }
}
