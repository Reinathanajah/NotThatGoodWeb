import assert from 'node:assert/strict'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { fileObjects } from '../../db/schema.js'
import { requestJson } from '../helpers/http.js'

export async function verifyAssignmentValidationAndSubmit(
  baseUrl: string,
  authHeaders: Record<string, string>,
  studentId: string,
): Promise<void> {
  const [ownedFile] = await db
    .select({ id: fileObjects.id })
    .from(fileObjects)
    .where(eq(fileObjects.ownerUserId, studentId))
    .limit(1)
  const [foreignFile] = await db
    .select({ id: fileObjects.id })
    .from(fileObjects)
    .where(eq(fileObjects.originalName, 'Module 1 - Introduction to Telecommunication Networks.pdf'))
    .limit(1)
  assert.ok(ownedFile && foreignFile)

  const missingDecl = await requestJson(baseUrl, '/assignments/3209504/submission', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'submit',
      fileIds: [ownedFile.id],
      declarationAccepted: false,
    }),
  })
  assert.equal(missingDecl.status, 400)

  const emptySubmit = await requestJson(baseUrl, '/assignments/3209504/submission', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'submit',
      fileIds: [],
      declarationAccepted: true,
    }),
  })
  assert.equal(emptySubmit.status, 400)

  const idorAttempt = await requestJson(baseUrl, '/assignments/3209504/submission', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'submit',
      fileIds: [foreignFile.id],
      declarationAccepted: true,
    }),
  })
  assert.equal(idorAttempt.status, 403)
  console.log('PASS submission validation (declaration, empty body, file ownership 403)')

  const draft = await requestJson<{
    submissionStatus: { status: string; files: Array<{ id: string }> }
  }>(baseUrl, '/assignments/3209504/submission', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'draft',
      fileIds: [ownedFile.id],
      declarationAccepted: false,
    }),
  })
  assert.equal(draft.status, 200)
  assert.equal(draft.body.data?.submissionStatus.status, 'draft')
  assert.equal(draft.body.data?.submissionStatus.files.length, 1)

  const submitted = await requestJson<{
    submissionStatus: {
      status: string
      declarationAccepted: boolean
      plagiarismJobs: Array<{ provider: string; status: string }>
    }
  }>(baseUrl, '/assignments/3209504/submission', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'submit',
      fileIds: [ownedFile.id],
      declarationAccepted: true,
    }),
  })
  assert.equal(submitted.status, 200)
  assert.equal(submitted.body.data?.submissionStatus.status, 'submitted')
  assert.equal(submitted.body.data?.submissionStatus.declarationAccepted, true)
  assert.equal(submitted.body.data?.submissionStatus.plagiarismJobs.length, 1)
  assert.equal(submitted.body.data?.submissionStatus.plagiarismJobs[0]?.provider, 'compilatio')
  assert.equal(submitted.body.data?.submissionStatus.plagiarismJobs[0]?.status, 'completed')

  // Guard finalized submission from reverting back to draft or exceeding maxAttempts
  const revertDraft = await requestJson(baseUrl, '/assignments/3209504/submission', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'draft',
      fileIds: [ownedFile.id],
      declarationAccepted: true,
    }),
  })
  assert.equal(revertDraft.status, 400)

  const plagStatus = await requestJson<{ provider: string; jobs: Array<{ status: string }> }>(
    baseUrl,
    '/assignments/3209504/plagiarism/status',
    { headers: authHeaders },
  )
  assert.equal(plagStatus.status, 200)
  assert.equal(plagStatus.body.data?.provider, 'compilatio')

  const plagResubmit = await requestJson<{ jobs: Array<{ status: string }> }>(
    baseUrl,
    '/assignments/3209504/plagiarism/submit',
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(plagResubmit.status, 200)
  assert.equal(plagResubmit.body.data?.jobs[0]?.status, 'completed')

  const noPlagAssign = await requestJson(
    baseUrl,
    '/assignments/3213297/plagiarism/submit',
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(noPlagAssign.status, 400)
  console.log('PASS draft, final submit, & Compilatio plagiarism pipeline')
}
