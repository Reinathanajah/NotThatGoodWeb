import assert from 'node:assert/strict'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import { verifyCourseDetailAndCompletion } from './suites/courseModules.suite.js'
import { verifyResourcesAndDownloads } from './suites/resourcesDownload.suite.js'

void withTestServer('Wave 5', async (baseUrl) => {
  assert.equal((await requestJson(baseUrl, '/courses/102037')).status, 401)
  assert.equal((await requestJson(baseUrl, '/resources/1')).status, 401)
  console.log('PASS unauthenticated /courses/:id & /resources/:moduleId rejected (401)')

  const login = await loginAccount(baseUrl, 'student.demo')
  const { vizModuleId, simModuleId } = await verifyCourseDetailAndCompletion(
    baseUrl,
    login.headers,
  )
  await verifyResourcesAndDownloads(baseUrl, login.headers, vizModuleId, simModuleId)
  await logoutAccount(baseUrl, login.headers)
})
