import assert from 'node:assert/strict'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import { verifyCalendarEventsFlow } from './suites/calendar.suite.js'
import { verifyMessagesFlow, verifyNotificationsFlow } from './suites/comms.suite.js'

void withTestServer('Wave 9', async (baseUrl) => {
  assert.equal((await requestJson(baseUrl, '/calendar/events')).status, 401)
  assert.equal((await requestJson(baseUrl, '/notifications')).status, 401)
  assert.equal((await requestJson(baseUrl, '/messages/conversations')).status, 401)
  console.log('PASS unauthenticated /calendar, /notifications, /messages rejected (401)')

  const login = await loginAccount(baseUrl, 'student.demo')
  await verifyCalendarEventsFlow(baseUrl, login.headers)
  await verifyNotificationsFlow(baseUrl, login.headers, login.user.id)
  await verifyMessagesFlow(baseUrl, login.headers, login.user.id)
  await logoutAccount(baseUrl, login.headers)
})
