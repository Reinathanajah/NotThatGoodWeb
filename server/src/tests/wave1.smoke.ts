import assert from 'node:assert/strict'
import { loginAccount, requestJson, withTestServer } from './helpers/http.js'
import {
  verifyPasswordResetAndLogout,
  verifySessionLifecycle,
} from './suites/authSession.suite.js'

interface LoginProfile {
  username: string
  email: string
  faculty: { name: string } | null
  program: { name: string } | null
}

void withTestServer('Wave 1', async (baseUrl) => {
  const health = await requestJson<{
    wave: number
    activeWaves: number[]
    database: { ok: boolean; latencyMs: number }
  }>(baseUrl, '/health')
  assert.equal(health.status, 200)
  assert.equal(health.body.ok, true)
  assert.ok(health.body.data?.activeWaves?.includes(1))
  assert.equal(health.body.data?.database.ok, true)
  console.log(`PASS health (Neon latency: ${health.body.data?.database.latencyMs}ms)`)

  const badLogin = await requestJson(baseUrl, '/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: 'student.demo',
      password: 'wrong-password',
    }),
  })
  assert.equal(badLogin.status, 401)
  assert.equal(badLogin.body.ok, false)
  console.log('PASS invalid login rejected (401)')

  const login = await loginAccount<LoginProfile>(baseUrl, 'student.demo')
  assert.ok(login.accessToken.length > 20)
  assert.equal(login.user.username, 'student.demo')
  assert.equal(login.user.faculty?.name, 'Faculty of Engineering')
  assert.equal(login.user.program?.name, 'B.Eng. Computer Engineering')
  console.log('PASS login (student.demo)')

  await verifySessionLifecycle(baseUrl, login.headers, login.sessionId)
  await verifyPasswordResetAndLogout(baseUrl, login.headers)
})
