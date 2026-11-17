import assert from 'node:assert/strict'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  assignmentSubmissions,
  courseModules,
  moduleCompletions,
} from '../db/schema.js'
import {
  prepareUpcomingAssignmentWindow,
  restoreAssignmentWindow,
  type AssignmentWindowBackup,
} from './helpers/assignmentWindow.js'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import { verifyAssignmentValidationAndSubmit } from './suites/assignmentsFlow.suite.js'

void withTestServer('Wave 6', async (baseUrl) => {
  let studentId: string | null = null
  let authHeaders: Record<string, string> | null = null
  let windowBackup: AssignmentWindowBackup | null = null

  try {
    assert.equal((await requestJson(baseUrl, '/assignments/3213297')).status, 401)
    console.log('PASS unauthenticated /assignments/:moduleId rejected (401)')

    const login = await loginAccount(baseUrl, 'student.demo')
    studentId = login.user.id
    authHeaders = login.headers
    windowBackup = await prepareUpcomingAssignmentWindow(3213297, studentId)

    const cs2 = await requestJson<{
      title: string
      submissionStatus: { status: string; gradingStatus: string; attemptNumber: number }
      navigation: { prev: { title: string } | null; next: { title: string } | null }
    }>(baseUrl, '/assignments/3213297', { headers: authHeaders })
    assert.equal(cs2.status, 200)
    assert.equal(cs2.body.data?.title, 'Case Study Submission Module 2')
    assert.equal(cs2.body.data?.submissionStatus.status, 'none')
    assert.equal(cs2.body.data?.submissionStatus.gradingStatus, 'not_graded')
    assert.equal(cs2.body.data?.submissionStatus.attemptNumber, 1)
    assert.equal(cs2.body.data?.navigation.prev?.title, 'Pre-Lab Assignment Module 2')
    assert.equal(cs2.body.data?.navigation.next?.title, 'Supplementary Lab Assignment Module 2')
    console.log('PASS GET /assignments/3213297 (status & prev/next navigation)')

    const earlySubmit = await requestJson(baseUrl, '/assignments/3213297/submission', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        action: 'draft',
        onlineText: 'Early draft',
        fileIds: [],
        declarationAccepted: true,
      }),
    })
    assert.equal(earlySubmit.status, 400)
    console.log('PASS PUT /assignments/3213297/submission before opensAt rejected (400)')

    const mls = await requestJson<{
      rules: { maxFiles: number; plagiarismProvider: string | null }
      navigation: { prev: { title: string } | null; next: { title: string } | null }
    }>(baseUrl, '/assignments/3209504', { headers: authHeaders })
    assert.equal(mls.status, 200)
    assert.equal(mls.body.data?.rules.maxFiles, 10)
    assert.equal(mls.body.data?.rules.plagiarismProvider, 'compilatio')
    assert.equal(
      mls.body.data?.navigation.prev?.title,
      'Multiobjective Least Squares Assignment (Monday)',
    )
    console.log('PASS GET /assignments/3209504 (Compilatio & academic integrity rules)')

    await verifyAssignmentValidationAndSubmit(baseUrl, authHeaders, studentId)

    const createdComment = await requestJson<{ author: { fullName: string } }>(
      baseUrl,
      '/assignments/3209504/comments',
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ body: 'Confirming answer details for problem 15.7.' }),
      },
    )
    assert.equal(createdComment.status, 201)
    assert.equal(createdComment.body.data?.author.fullName, 'Jordan Rivera')

    const commentsList = await requestJson<Array<{ body: string }>>(
      baseUrl,
      '/assignments/3209504/comments',
      { headers: authHeaders },
    )
    assert.ok(commentsList.body.data?.some((c) => c.body.includes('problem 15.7')))
    console.log('PASS GET & POST /assignments/:moduleId/comments')
  } finally {
    await restoreAssignmentWindow(windowBackup)
    if (studentId) {
      const [mlsMod] = await db
        .select({ id: courseModules.id })
        .from(courseModules)
        .where(eq(courseModules.moodleModuleId, 3209504))
        .limit(1)
      if (mlsMod) {
        await db
          .delete(assignmentSubmissions)
          .where(
            and(
              eq(assignmentSubmissions.assignmentModuleId, mlsMod.id),
              eq(assignmentSubmissions.userId, studentId),
            ),
          )
        await db
          .delete(moduleCompletions)
          .where(
            and(
              eq(moduleCompletions.moduleId, mlsMod.id),
              eq(moduleCompletions.userId, studentId),
            ),
          )
      }
    }
    if (authHeaders) {
      await logoutAccount(baseUrl, authHeaders)
    }
  }
})
