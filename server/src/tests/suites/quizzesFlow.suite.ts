import assert from 'node:assert/strict'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courseModules, enrollments } from '../../db/schema.js'
import { requestJson } from '../helpers/http.js'

export async function verifyClosedQuizGuard(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const [mlsQuizMod] = await db
    .select({ id: courseModules.id })
    .from(courseModules)
    .where(eq(courseModules.title, 'Post Test MLS (Monday)'))
    .limit(1)
  assert.ok(mlsQuizMod)

  const closedDetail = await requestJson<{
    windowStatus: string
    canStartAttempt: boolean
    questionCount: number
    navigation: { prev: { title: string } | null }
  }>(baseUrl, `/quizzes/${mlsQuizMod.id}`, { headers: authHeaders })
  assert.equal(closedDetail.status, 200)
  assert.equal(closedDetail.body.data?.windowStatus, 'closed')
  assert.equal(closedDetail.body.data?.canStartAttempt, false)
  assert.equal(closedDetail.body.data?.questionCount, 1)
  assert.equal(closedDetail.body.data?.navigation.prev?.title, 'Linear-Multiobj-LS-simulation')

  const startClosed = await requestJson(baseUrl, `/quizzes/${mlsQuizMod.id}/attempts`, {
    method: 'POST',
    headers: authHeaders,
  })
  assert.equal(startClosed.status, 400)
  console.log('PASS closed quiz window enforcement (GET detail & POST 400)')
}

export async function verifyQuizAttemptLifecycle(
  baseUrl: string,
  authHeaders: Record<string, string>,
  quizModuleId: number,
  studentId: string,
  courseId: number,
): Promise<void> {
  const started = await requestJson<{
    attemptId: string
    attemptNumber: number
    questions: Array<Record<string, unknown>>
  }>(baseUrl, `/quizzes/${quizModuleId}/attempts`, {
    method: 'POST',
    headers: authHeaders,
  })
  assert.equal(started.status, 201)
  const attemptId = started.body.data!.attemptId
  assert.equal(started.body.data?.attemptNumber, 1)
  assert.equal(started.body.data?.questions.length, 2)
  assert.equal('correctIndex' in started.body.data!.questions[0], false)

  const resumed = await requestJson<{ attemptId: string }>(
    baseUrl,
    `/quizzes/${quizModuleId}/attempts`,
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(resumed.body.data?.attemptId, attemptId)
  console.log('PASS start/resume attempt & sanitized questions (no correctIndex leak)')

  assert.equal(
    (
      await requestJson(baseUrl, `/quizzes/attempts/${attemptId}/answers`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ answers: { nonexistent: 0 } }),
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await requestJson(baseUrl, `/quizzes/attempts/${attemptId}/answers`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ answers: { oq1: 9 } }),
      })
    ).status,
    400,
  )

  const saved = await requestJson<{ answers: Record<string, number> }>(
    baseUrl,
    `/quizzes/attempts/${attemptId}/answers`,
    {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ answers: { oq1: 1 } }),
    },
  )
  assert.equal(saved.status, 200)
  assert.equal(saved.body.data?.answers.oq1, 1)
  console.log('PASS PATCH /quizzes/attempts/:attemptId/answers + validation')

  const submitted = await requestJson<{
    status: string
    score: string
    earnedPoints: number
    totalPoints: number
  }>(baseUrl, `/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ answers: { oq2: 0 } }),
  })
  assert.equal(submitted.status, 200)
  assert.equal(submitted.body.data?.status, 'submitted')
  assert.equal(submitted.body.data?.score, '50.00')
  assert.equal(submitted.body.data?.earnedPoints, 50)
  assert.equal(submitted.body.data?.totalPoints, 100)

  const doubleSubmit = await requestJson(
    baseUrl,
    `/quizzes/attempts/${attemptId}/submit`,
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(doubleSubmit.status, 400)

  const secondAttempt = await requestJson(baseUrl, `/quizzes/${quizModuleId}/attempts`, {
    method: 'POST',
    headers: authHeaders,
  })
  assert.equal(secondAttempt.status, 400)

  const [enrollment] = await db
    .select({ cachedFinalGrade: enrollments.cachedFinalGrade })
    .from(enrollments)
    .where(and(eq(enrollments.userId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1)
  assert.equal(enrollment?.cachedFinalGrade, '50.00')
  console.log('PASS POST /quizzes/attempts/:attemptId/submit + gradebook sync + maxAttempts')
}
