import assert from 'node:assert/strict'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import { verifyCourseOverviewAndPreferences } from './suites/coursesOverview.suite.js'
import { verifyTimelineAndClock } from './suites/dashboardTimeline.suite.js'

void withTestServer('Wave 4', async (baseUrl) => {
  assert.equal((await requestJson(baseUrl, '/dashboard/timeline')).status, 401)
  assert.equal((await requestJson(baseUrl, '/courses/my')).status, 401)
  console.log('PASS unauthenticated /dashboard/timeline & /courses/my rejected (401)')

  const login = await loginAccount(baseUrl, 'student.demo')
  await verifyTimelineAndClock(baseUrl, login.headers)
  await verifyCourseOverviewAndPreferences(baseUrl, login.headers)
  await logoutAccount(baseUrl, login.headers)
})
