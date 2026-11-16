import { inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignments,
  assignmentSubmissions,
  fileObjects,
} from '../../db/schema.js'
import { BadRequestError, ForbiddenError } from '../../utils/errors.js'

export interface SubmissionInput {
  action: 'draft' | 'submit'
  onlineText?: string | null
  fileIds: string[]
  declarationAccepted: boolean
}

export function assertSubmissionStateEditable(
  assignRow: typeof assignments.$inferSelect,
  existing: typeof assignmentSubmissions.$inferSelect | null,
  input: SubmissionInput,
  nowMs: number,
): { createNextAttempt: boolean; nextAttemptNumber: number } {
  if (assignRow.opensAt && nowMs < assignRow.opensAt.getTime()) {
    throw new BadRequestError('Assignment is not open for submissions yet')
  }
  if (assignRow.cutoffAt && nowMs > assignRow.cutoffAt.getTime()) {
    throw new BadRequestError('Assignment cut-off date has passed')
  }
  if (existing?.gradingStatus === 'graded') {
    throw new BadRequestError('Submission has already been graded and cannot be modified')
  }

  if (existing?.status === 'submitted') {
    if (input.action === 'draft') {
      throw new BadRequestError('Finalized submission cannot be reverted to draft')
    }
    if (existing.attemptNumber >= assignRow.maxAttempts) {
      throw new BadRequestError('Maximum number of submission attempts reached')
    }
    return { createNextAttempt: true, nextAttemptNumber: existing.attemptNumber + 1 }
  }

  return { createNextAttempt: false, nextAttemptNumber: existing?.attemptNumber ?? 1 }
}

export async function validateSubmissionPayload(
  userId: string,
  assignRow: typeof assignments.$inferSelect,
  input: SubmissionInput,
) {
  const uniqueFileIds = [...new Set(input.fileIds)]
  const trimmedText = input.onlineText?.trim() ? input.onlineText.trim() : null

  if (uniqueFileIds.length > assignRow.maxFiles) {
    throw new BadRequestError(
      `Maximum number of files allowed is ${assignRow.maxFiles}`,
      [{ field: 'body.fileIds', message: `Exceeded maxFiles (${assignRow.maxFiles})` }],
    )
  }

  if (input.action === 'submit' && uniqueFileIds.length === 0 && !trimmedText) {
    throw new BadRequestError('At least one file or online text is required to submit', [
      { field: 'body.fileIds', message: 'Submission content is required' },
    ])
  }

  if (
    input.action === 'submit' &&
    assignRow.requireSubmissionStatement &&
    !input.declarationAccepted
  ) {
    throw new BadRequestError(
      'Academic integrity declaration must be accepted before submitting',
      [
        {
          field: 'body.declarationAccepted',
          message: 'Required academic integrity statement must be accepted',
        },
      ],
    )
  }

  const ownedFiles =
    uniqueFileIds.length > 0
      ? await db.select().from(fileObjects).where(inArray(fileObjects.id, uniqueFileIds))
      : []

  if (ownedFiles.length !== uniqueFileIds.length) {
    throw new BadRequestError('One or more attached files could not be found', [
      { field: 'body.fileIds', message: 'Invalid fileId referenced' },
    ])
  }

  for (const file of ownedFiles) {
    if (file.ownerUserId !== userId) {
      throw new ForbiddenError('You can only attach files that you own')
    }
    if (file.sizeBytes > assignRow.maxFileSizeBytes) {
      throw new BadRequestError(
        `File "${file.displayName}" exceeds maximum size of ${assignRow.maxFileSizeBytes} bytes`,
        [{ field: 'body.fileIds', message: 'File size limit exceeded' }],
      )
    }
  }

  return { uniqueFileIds, trimmedText, ownedFiles }
}
