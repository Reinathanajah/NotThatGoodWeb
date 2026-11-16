import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignmentSubmissionFiles,
  fileObjects,
  plagiarismJobs,
} from '../../db/schema.js'
import { BadRequestError } from '../../utils/errors.js'
import { getLatestSubmission, loadAuthorizedAssignment } from './assignments.access.js'
import { getPlagiarismScanner } from './plagiarism.adapter.js'

export async function enqueuePlagiarismScanForSubmission(
  submissionId: string,
  provider: string,
  files: Array<{
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
    sha256: string | null
  }>,
) {
  const scanner = getPlagiarismScanner(provider)
  if (!scanner) {
    throw new BadRequestError('Plagiarism scanning is not enabled for this assignment')
  }

  const now = new Date()
  const results = []

  for (const file of files) {
    const scan = await scanner.submitDocument({
      submissionId,
      fileId: file.id,
      filename: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      sha256: file.sha256,
    })

    await db
      .delete(plagiarismJobs)
      .where(
        and(
          eq(plagiarismJobs.submissionId, submissionId),
          eq(plagiarismJobs.fileObjectId, file.id),
        ),
      )

    const [job] = await db
      .insert(plagiarismJobs)
      .values({
        submissionId,
        fileObjectId: file.id,
        provider: scanner.provider,
        externalDocumentId: scan.externalDocumentId,
        status: scan.status,
        similarityPercent: scan.similarityPercent,
        reportUrl: scan.reportUrl,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    results.push({ ...job, fileName: file.originalName })
  }

  return results
}

export async function triggerPlagiarismSubmit(userId: string, rawModuleId: number) {
  const { mod, assignRow } = await loadAuthorizedAssignment(userId, rawModuleId)

  if (!assignRow.plagiarismProvider) {
    throw new BadRequestError('Compilatio plagiarism service is not enabled on this assignment')
  }

  const submission = await getLatestSubmission(mod.id, userId)
  if (!submission) {
    throw new BadRequestError('No submission found for this assignment')
  }

  const files = await db
    .select({
      id: fileObjects.id,
      originalName: fileObjects.originalName,
      mimeType: fileObjects.mimeType,
      sizeBytes: fileObjects.sizeBytes,
      sha256: fileObjects.sha256,
    })
    .from(assignmentSubmissionFiles)
    .innerJoin(fileObjects, eq(assignmentSubmissionFiles.fileObjectId, fileObjects.id))
    .where(eq(assignmentSubmissionFiles.submissionId, submission.id))

  if (files.length === 0) {
    throw new BadRequestError('No files attached to scan')
  }

  const jobs = await enqueuePlagiarismScanForSubmission(
    submission.id,
    assignRow.plagiarismProvider,
    files,
  )

  return {
    assignmentModuleId: mod.id,
    submissionId: submission.id,
    provider: assignRow.plagiarismProvider,
    jobs,
  }
}

export async function getPlagiarismStatus(userId: string, rawModuleId: number) {
  const { mod, assignRow } = await loadAuthorizedAssignment(userId, rawModuleId)
  const submission = await getLatestSubmission(mod.id, userId)

  if (!submission) {
    return {
      assignmentModuleId: mod.id,
      provider: assignRow.plagiarismProvider,
      jobs: [],
    }
  }

  const jobs = await db
    .select({
      id: plagiarismJobs.id,
      fileObjectId: plagiarismJobs.fileObjectId,
      fileName: fileObjects.originalName,
      provider: plagiarismJobs.provider,
      externalDocumentId: plagiarismJobs.externalDocumentId,
      status: plagiarismJobs.status,
      similarityPercent: plagiarismJobs.similarityPercent,
      reportUrl: plagiarismJobs.reportUrl,
      createdAt: plagiarismJobs.createdAt,
      updatedAt: plagiarismJobs.updatedAt,
    })
    .from(plagiarismJobs)
    .innerJoin(fileObjects, eq(plagiarismJobs.fileObjectId, fileObjects.id))
    .where(eq(plagiarismJobs.submissionId, submission.id))
    .orderBy(desc(plagiarismJobs.updatedAt))

  return {
    assignmentModuleId: mod.id,
    submissionId: submission.id,
    provider: assignRow.plagiarismProvider,
    jobs,
  }
}
