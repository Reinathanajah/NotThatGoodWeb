import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { fileObjects, privateFiles } from '../../db/schema.js'
import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors.js'
import { removeStoredFileIfExists } from '../../utils/storage.js'
import { getPrivateFilesQuota } from './files.quota.js'
import { collectDescendantFileObjectIds, findReferencedFileObjectIds } from './files.references.js'

export async function deleteUserFileOrFolder(userId: string, targetId: string) {
  const [privateEntry] = await db
    .select()
    .from(privateFiles)
    .where(and(eq(privateFiles.id, targetId), eq(privateFiles.userId, userId)))
    .limit(1)

  if (privateEntry) {
    const candidateFileIds = privateEntry.isFolder
      ? await collectDescendantFileObjectIds(userId, privateEntry.id)
      : privateEntry.fileObjectId
        ? [privateEntry.fileObjectId]
        : []

    await db.delete(privateFiles).where(eq(privateFiles.id, privateEntry.id))

    const referencedIds = await findReferencedFileObjectIds(candidateFileIds)
    const unreferencedIds = candidateFileIds.filter((id) => !referencedIds.has(id))

    if (unreferencedIds.length > 0) {
      const deletedObjs = await db
        .delete(fileObjects)
        .where(
          and(
            inArray(fileObjects.id, unreferencedIds),
            eq(fileObjects.ownerUserId, userId),
          ),
        )
        .returning({ storageKey: fileObjects.storageKey })

      await Promise.all(deletedObjs.map((obj) => removeStoredFileIfExists(obj.storageKey)))
    }

    const quota = await getPrivateFilesQuota(userId)
    return {
      deletedId: privateEntry.id,
      kind: privateEntry.isFolder ? 'folder' : 'private_file',
      quota: {
        quotaBytes: quota.quotaBytes,
        usedBytes: quota.usedBytes,
        remainingBytes: quota.remainingBytes,
      },
    }
  }

  const [fileObj] = await db
    .select()
    .from(fileObjects)
    .where(eq(fileObjects.id, targetId))
    .limit(1)

  if (!fileObj) {
    throw new NotFoundError('File not found')
  }
  if (fileObj.ownerUserId !== userId) {
    throw new ForbiddenError('You do not own this file')
  }
  if ((await findReferencedFileObjectIds([fileObj.id])).has(fileObj.id)) {
    throw new ConflictError(
      'Cannot delete file because it is attached to an assignment submission or course resource',
    )
  }

  await db.delete(fileObjects).where(eq(fileObjects.id, fileObj.id))
  await removeStoredFileIfExists(fileObj.storageKey)

  const quota = await getPrivateFilesQuota(userId)
  return {
    deletedId: fileObj.id,
    kind: 'file_object',
    quota: {
      quotaBytes: quota.quotaBytes,
      usedBytes: quota.usedBytes,
      remainingBytes: quota.remainingBytes,
    },
  }
}
