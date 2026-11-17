import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { fileObjects, privateFiles } from '../../db/schema.js'
import {
  buildPrivateFolderBreadcrumbs,
  resolveOwnedPrivateFolder,
} from './files.folders.js'
import { getPrivateFilesQuota } from './files.quota.js'

export async function listPrivateFiles(
  userId: string,
  options: { folderId?: string; view: 'grid' | 'list' | 'tree' },
) {
  const currentFolder = options.folderId
    ? await resolveOwnedPrivateFolder(userId, options.folderId)
    : null

  const [quota, breadcrumbs, rows] = await Promise.all([
    getPrivateFilesQuota(userId),
    buildPrivateFolderBreadcrumbs(userId, options.folderId),
    db
      .select({
        id: privateFiles.id,
        parentFolderId: privateFiles.parentFolderId,
        isFolder: privateFiles.isFolder,
        name: privateFiles.name,
        fileObjectId: privateFiles.fileObjectId,
        createdAt: privateFiles.createdAt,
        updatedAt: privateFiles.updatedAt,
        fileOriginalName: fileObjects.originalName,
        fileDisplayName: fileObjects.displayName,
        fileMimeType: fileObjects.mimeType,
        fileSizeBytes: fileObjects.sizeBytes,
        fileAuthorName: fileObjects.authorName,
        fileLicense: fileObjects.license,
        fileUploadedAt: fileObjects.uploadedAt,
        fileSha256: fileObjects.sha256,
      })
      .from(privateFiles)
      .leftJoin(fileObjects, eq(privateFiles.fileObjectId, fileObjects.id))
      .where(
        options.view === 'tree'
          ? eq(privateFiles.userId, userId)
          : and(
              eq(privateFiles.userId, userId),
              options.folderId
                ? eq(privateFiles.parentFolderId, options.folderId)
                : isNull(privateFiles.parentFolderId),
            ),
      )
      .orderBy(desc(privateFiles.isFolder), asc(privateFiles.name)),
  ])

  const entries = rows.map((row) => ({
    id: row.id,
    parentFolderId: row.parentFolderId,
    isFolder: row.isFolder,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    file: row.fileObjectId
      ? {
          id: row.fileObjectId,
          originalName: row.fileOriginalName,
          displayName: row.fileDisplayName,
          mimeType: row.fileMimeType,
          sizeBytes: row.fileSizeBytes,
          authorName: row.fileAuthorName,
          license: row.fileLicense,
          uploadedAt: row.fileUploadedAt,
          sha256: row.fileSha256,
          downloadUrl: `/api/v1/files/${row.fileObjectId}/download`,
        }
      : null,
  }))

  return {
    view: options.view,
    quota: {
      quotaBytes: quota.quotaBytes,
      usedBytes: quota.usedBytes,
      remainingBytes: quota.remainingBytes,
      maxUploadFileBytes: quota.maxUploadFileBytes,
    },
    currentFolder: currentFolder
      ? {
          id: currentFolder.id,
          name: currentFolder.name,
          parentFolderId: currentFolder.parentFolderId,
        }
      : null,
    breadcrumbs,
    entries,
  }
}
