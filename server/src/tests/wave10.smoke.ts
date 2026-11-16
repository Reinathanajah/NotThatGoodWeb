import assert from 'node:assert/strict'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { gradeItems, grades, staticPages, supportTickets } from '../db/schema.js'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import {
  verifyGradesOverviewAndCourseBook,
  verifyLearnerScriptReports,
} from './suites/gradesReports.suite.js'
import {
  verifyAuthenticatedSupport,
  verifyPublicStaticPagesAndGuestSupport,
} from './suites/staticSupport.suite.js'

void withTestServer('Wave 10', async (baseUrl) => {
  const createdTicketIds: string[] = []
  let tempHiddenItemId: number | null = null
  let visibleGradeItemId: number | null = null
  let tempPrivateSlug: string | null = null
  let studentId: string | null = null
  let studentHeaders: Record<string, string> | null = null
  let adminHeaders: Record<string, string> | null = null

  try {
    const health = await requestJson<{ wave: number; activeWaves: number[] }>(baseUrl, '/health')
    assert.equal(health.status, 200)
    assert.equal(health.body.data?.wave, 10)
    assert.deepEqual(health.body.data?.activeWaves, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    assert.equal((await requestJson(baseUrl, '/grades/overview')).status, 401)
    assert.equal((await requestJson(baseUrl, '/courses/812679/grades')).status, 401)
    assert.equal((await requestJson(baseUrl, '/reports/learner-script')).status, 401)
    assert.equal((await requestJson(baseUrl, '/reports/learner-script/student-progress')).status, 401)
    console.log('PASS unauthenticated /grades & /reports rejected (401)')

    tempPrivateSlug = await verifyPublicStaticPagesAndGuestSupport(baseUrl, createdTicketIds)

    const studentLogin = await loginAccount(baseUrl, 'student.demo')
    studentId = studentLogin.user.id
    studentHeaders = studentLogin.headers

    const adminLogin = await loginAccount(baseUrl, 'admin.silverfour')
    adminHeaders = adminLogin.headers

    const privPage = await requestJson(baseUrl, `/static-pages/${tempPrivateSlug}`, {
      headers: studentHeaders,
    })
    assert.equal(privPage.status, 200)
    assert.equal(privPage.headers.get('cache-control'), 'private, no-cache')

    const gradeCleanup = await verifyGradesOverviewAndCourseBook(
      baseUrl,
      studentHeaders,
      adminHeaders,
      studentId,
    )
    visibleGradeItemId = gradeCleanup.visibleGradeItemId
    tempHiddenItemId = gradeCleanup.tempHiddenItemId

    await verifyLearnerScriptReports(baseUrl, studentHeaders)
    await verifyAuthenticatedSupport(
      baseUrl,
      studentHeaders,
      studentId,
      studentLogin.user.email,
      createdTicketIds,
    )
  } finally {
    if (visibleGradeItemId !== null && studentId !== null) {
      await db
        .delete(grades)
        .where(and(eq(grades.gradeItemId, visibleGradeItemId), eq(grades.userId, studentId)))
    }
    if (tempHiddenItemId !== null) {
      await db.delete(gradeItems).where(eq(gradeItems.id, tempHiddenItemId))
    }
    if (tempPrivateSlug !== null) {
      await db.delete(staticPages).where(eq(staticPages.slug, tempPrivateSlug))
    }
    if (createdTicketIds.length > 0) {
      await db.delete(supportTickets).where(inArray(supportTickets.id, createdTicketIds))
    }
    if (studentHeaders) await logoutAccount(baseUrl, studentHeaders)
    if (adminHeaders) await logoutAccount(baseUrl, adminHeaders)
  }
})
