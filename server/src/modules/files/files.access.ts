import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignmentSubmissionFiles,
  assignmentSubmissions,
  courseModules,
  enrollments,
  fileObjects,
  privateFiles,
  resources,
} from '../../db/schema.js'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors.js'
import { readFileObjectBytes } from '../../utils/storage.js'

async function resolveAccessibleFileObject(userId: string, rawFileId: string) {
  let fileObjectId = rawFileId

  const [privateEntry] = await db
    .select({ fileObjectId: privateFiles.fileObjectId, isFolder: privateFiles.isFolder })
    .from(privateFiles)
    .where(and(eq(privateFiles.id, rawFileId), eq(privateFiles.userId, userId)))
    .limit(1)

  if (privateEntry) {
    if (privateEntry.isFolder || !privateEntry.fileObjectId) {
      throw new BadRequestError('Folders cannot be downloaded as a file')
    }
    fileObjectId = privateEntry.fileObjectId
  }

  const [fileObj] = await db
    .select()
    .from(fileObjects)
    .where(eq(fileObjects.id, fileObjectId))
    .limit(1)

  if (!fileObj) {
    throw new NotFoundError('File not found')
  }
  if (fileObj.ownerUserId === userId) {
    return fileObj
  }

  const [[resourceEnrollment], [submissionAccess]] = await Promise.all([
    db
      .select({ courseId: enrollments.courseId })
      .from(resources)
      .innerJoin(courseModules, eq(resources.moduleId, courseModules.id))
      .innerJoin(
        enrollments,
        and(
          eq(enrollments.courseId, courseModules.courseId),
          eq(enrollments.userId, userId),
        ),
      )
      .where(and(eq(resources.fileObjectId, fileObj.id), eq(courseModules.visible, true)))
      .limit(1),
    db
      .select({ submissionId: assignmentSubmissions.id })
      .from(assignmentSubmissionFiles)
      .innerJoin(
        assignmentSubmissions,
        eq(assignmentSubmissionFiles.submissionId, assignmentSubmissions.id),
      )
      .where(
        and(
          eq(assignmentSubmissionFiles.fileObjectId, fileObj.id),
          eq(assignmentSubmissions.userId, userId),
        ),
      )
      .limit(1),
  ])

  if (!resourceEnrollment && !submissionAccess) {
    throw new ForbiddenError('You do not have permission to access this file')
  }

  return fileObj
}

export async function getFileDownloadPayload(userId: string, fileId: string) {
  const file = await resolveAccessibleFileObject(userId, fileId)
  const bytes = await readFileObjectBytes(file)
  if (!bytes) {
    throw new NotFoundError('Stored file content not found')
  }

  return {
    file,
    buffer: bytes.buffer,
    isSeededStub: bytes.isSeededStub,
  }
}
