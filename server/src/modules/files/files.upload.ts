import crypto from 'node:crypto'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import { env } from '../../config/env.js'
import { db } from '../../db/index.js'
import { fileObjects, privateFiles } from '../../db/schema.js'
import { sha256Hex } from '../../utils/crypto.js'
import { AppError } from '../../utils/errors.js'
import { removeStoredFileIfExists, saveUploadedBuffer } from '../../utils/storage.js'
import {
  assertUniquePrivateEntryName,
  resolveOwnedPrivateFolder,
} from './files.folders.js'
import { type FileLicense, getPrivateFilesQuota } from './files.quota.js'

const UPLOAD_QUOTA_LOCK_NAMESPACE = 7001

export async function saveUploadedFile(
  userId: string,
  file: Express.Multer.File,
  input: {
    saveAs?: string
    author?: string
    license: FileLicense
    target: 'private' | 'submission_draft'
    parentFolderId?: string
  },
) {
  if (file.size > env.MAX_UPLOAD_SIZE_BYTES) {
    throw new AppError(
      413,
      'PAYLOAD_TOO_LARGE',
      `File exceeds maximum upload limit of ${env.MAX_UPLOAD_SIZE_BYTES} bytes`,
    )
  }

  const displayName = (input.saveAs || file.originalname).replace(/[/\\]/g, '_')
  const digest = sha256Hex(file.buffer)
  const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '')
  const storageKey = `user-uploads/${userId}/${digest.slice(0, 16)}-${crypto.randomUUID()}${ext}`

  await saveUploadedBuffer(storageKey, file.buffer)

  try {
    const result = await db.transaction(async (tx) => {
      // Serialize per-user uploads so concurrent requests cannot exceed the 2 GB quota.
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext(${userId}), ${UPLOAD_QUOTA_LOCK_NAMESPACE})`,
      )

      const quota = await getPrivateFilesQuota(userId, tx)

      if (input.target === 'private') {
        if (quota.usedBytes + file.size > quota.quotaBytes) {
          throw new AppError(
            413,
            'QUOTA_EXCEEDED',
            'Private files 2 GB quota would be exceeded by this upload',
          )
        }
        if (input.parentFolderId) {
          await resolveOwnedPrivateFolder(userId, input.parentFolderId, tx)
        }
        await assertUniquePrivateEntryName(
          userId,
          input.parentFolderId ?? null,
          displayName,
          tx,
        )
      }

      const [fileObj] = await tx
        .insert(fileObjects)
        .values({
          ownerUserId: userId,
          originalName: file.originalname,
          displayName,
          mimeType: file.mimetype || 'application/octet-stream',
          sizeBytes: file.size,
          sha256: digest,
          storageKey,
          authorName: input.author ?? quota.ownerFullName,
          license: input.license,
        })
        .returning()

      let privateEntry = null
      if (input.target === 'private') {
        const [entry] = await tx
          .insert(privateFiles)
          .values({
            userId,
            parentFolderId: input.parentFolderId ?? null,
            isFolder: false,
            name: displayName,
            fileObjectId: fileObj.id,
          })
          .returning()
        privateEntry = entry
      }

      return { fileObj, privateEntry }
    })

    const updatedQuota = await getPrivateFilesQuota(userId)

    return {
      file: {
        ...result.fileObj,
        downloadUrl: `/api/v1/files/${result.fileObj.id}/download`,
      },
      privateEntry: result.privateEntry,
      quota: {
        quotaBytes: updatedQuota.quotaBytes,
        usedBytes: updatedQuota.usedBytes,
        remainingBytes: updatedQuota.remainingBytes,
      },
    }
  } catch (err) {
    await removeStoredFileIfExists(storageKey)
    throw err
  }
}
