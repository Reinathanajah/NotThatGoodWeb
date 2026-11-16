import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignmentSubmissionFiles,
  assignmentSubmissions,
  moduleCompletions,
} from '../../db/schema.js'
import { ConflictError } from '../../utils/errors.js'
import { getLatestSubmission, loadAuthorizedAssignment } from './assignments.access.js'
import { getAssignmentDetail } from './assignments.detail.js'
import { enqueuePlagiarismScanForSubmission } from './assignments.plagiarism.js'
import {
  assertSubmissionStateEditable,
  validateSubmissionPayload,
  type SubmissionInput,
} from './assignments.validation.js'

export async function upsertAssignmentSubmission(
  userId: string,
  rawModuleId: number,
  input: SubmissionInput,
) {
  const { mod, assignRow } = await loadAuthorizedAssignment(userId, rawModuleId)
  const existing = await getLatestSubmission(mod.id, userId)
  const now = new Date()

  const { createNextAttempt, nextAttemptNumber } = assertSubmissionStateEditable(
    assignRow,
    existing,
    input,
    now.getTime(),
  )
  const { uniqueFileIds, trimmedText, ownedFiles } = await validateSubmissionPayload(
    userId,
    assignRow,
    input,
  )

  const nextStatus = input.action === 'submit' ? 'submitted' : 'draft'

  const submissionId = await db.transaction(async (tx) => {
    let targetId: string

    if (existing && !createNextAttempt) {
      const [updated] = await tx
        .update(assignmentSubmissions)
        .set({
          status: nextStatus,
          onlineText: trimmedText,
          declarationAccepted: input.declarationAccepted,
          declarationAcceptedAt: input.declarationAccepted ? now : null,
          submittedAt: input.action === 'submit' ? now : null,
          lastModifiedAt: now,
        })
        .where(
          and(
            eq(assignmentSubmissions.id, existing.id),
            eq(assignmentSubmissions.gradingStatus, 'not_graded'),
          ),
        )
        .returning({ id: assignmentSubmissions.id })
      if (!updated) {
        throw new ConflictError('Submission was modified or graded concurrently')
      }
      targetId = updated.id
    } else {
      const [inserted] = await tx
        .insert(assignmentSubmissions)
        .values({
          assignmentModuleId: mod.id,
          userId,
          attemptNumber: nextAttemptNumber,
          status: nextStatus,
          gradingStatus: 'not_graded',
          onlineText: trimmedText,
          declarationAccepted: input.declarationAccepted,
          declarationAcceptedAt: input.declarationAccepted ? now : null,
          submittedAt: input.action === 'submit' ? now : null,
          lastModifiedAt: now,
        })
        .returning({ id: assignmentSubmissions.id })
      targetId = inserted.id
    }

    await tx
      .delete(assignmentSubmissionFiles)
      .where(eq(assignmentSubmissionFiles.submissionId, targetId))

    if (uniqueFileIds.length > 0) {
      await tx.insert(assignmentSubmissionFiles).values(
        uniqueFileIds.map((fileId) => ({
          submissionId: targetId,
          fileObjectId: fileId,
          attachedAt: now,
        })),
      )
    }

    if (input.action === 'submit' && mod.completionTrackable) {
      await tx
        .insert(moduleCompletions)
        .values({ userId, moduleId: mod.id, completedAt: now })
        .onConflictDoUpdate({
          target: [moduleCompletions.userId, moduleCompletions.moduleId],
          set: { completedAt: now },
        })
    }

    return targetId
  })

  if (
    input.action === 'submit' &&
    assignRow.plagiarismProvider === 'compilatio' &&
    ownedFiles.length > 0
  ) {
    await enqueuePlagiarismScanForSubmission(
      submissionId,
      assignRow.plagiarismProvider,
      ownedFiles,
    )
  }

  return getAssignmentDetail(userId, mod.id)
}
