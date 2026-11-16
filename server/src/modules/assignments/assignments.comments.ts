import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignmentSubmissions,
  submissionComments,
  users,
} from '../../db/schema.js'
import { getLatestSubmission, loadAuthorizedAssignment } from './assignments.access.js'

export async function listSubmissionComments(userId: string, rawModuleId: number) {
  const { mod } = await loadAuthorizedAssignment(userId, rawModuleId)
  const submission = await getLatestSubmission(mod.id, userId)

  if (!submission) return []

  return db
    .select({
      id: submissionComments.id,
      body: submissionComments.body,
      createdAt: submissionComments.createdAt,
      author: {
        id: users.id,
        fullName: users.fullName,
        role: users.role,
      },
    })
    .from(submissionComments)
    .innerJoin(users, eq(submissionComments.authorUserId, users.id))
    .where(eq(submissionComments.submissionId, submission.id))
    .orderBy(asc(submissionComments.createdAt))
}

export async function addSubmissionComment(
  userId: string,
  rawModuleId: number,
  body: string,
) {
  const { mod } = await loadAuthorizedAssignment(userId, rawModuleId)
  let submission = await getLatestSubmission(mod.id, userId)

  if (!submission) {
    const [created] = await db
      .insert(assignmentSubmissions)
      .values({
        assignmentModuleId: mod.id,
        userId,
        attemptNumber: 1,
        status: 'none',
        gradingStatus: 'not_graded',
      })
      .returning()
    submission = created
  }

  const [comment] = await db
    .insert(submissionComments)
    .values({
      submissionId: submission.id,
      authorUserId: userId,
      body,
    })
    .returning()

  const [author] = await db
    .select({ id: users.id, fullName: users.fullName, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    author,
  }
}
