import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifySessionLifecycle(
  baseUrl: string,
  authHeaders: Record<string, string>,
  sessionId: string,
): Promise<void> {
  const me = await requestJson<{ username: string; timezone: string }>(
    baseUrl,
    '/auth/me',
    { headers: authHeaders },
  )
  assert.equal(me.status, 200)
  assert.equal(me.body.data?.username, 'student.demo')
  assert.equal(me.body.data?.timezone, 'UTC')
  console.log('PASS GET /auth/me')

  const sessions = await requestJson<Array<{ id: string; isCurrent: boolean }>>(
    baseUrl,
    '/auth/sessions',
    { headers: authHeaders },
  )
  assert.equal(sessions.status, 200)
  assert.ok(sessions.body.data?.some((s) => s.id === sessionId && s.isCurrent))
  console.log('PASS GET /auth/sessions')

  const qr = await requestJson<{ qrToken: string; qrUri: string }>(
    baseUrl,
    '/auth/mobile-qr',
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(qr.status, 201)
  assert.ok(qr.body.data?.qrUri.startsWith('silverfour://link?token='))

  const qrLogin = await requestJson<{ accessToken: string; sessionId: string }>(
    baseUrl,
    '/auth/mobile-qr/exchange',
    {
      method: 'POST',
      body: JSON.stringify({ qrToken: qr.body.data!.qrToken }),
    },
  )
  assert.equal(qrLogin.status, 200)

  const qrReplay = await requestJson(baseUrl, '/auth/mobile-qr/exchange', {
    method: 'POST',
    body: JSON.stringify({ qrToken: qr.body.data!.qrToken }),
  })
  assert.equal(qrReplay.status, 401)

  const revoke = await requestJson(
    baseUrl,
    `/auth/sessions/${qrLogin.body.data!.sessionId}`,
    { method: 'DELETE', headers: authHeaders },
  )
  assert.equal(revoke.status, 200)

  const revokedCheck = await requestJson(baseUrl, '/auth/me', {
    headers: { Authorization: `Bearer ${qrLogin.body.data!.accessToken}` },
  })
  assert.equal(revokedCheck.status, 401)
  console.log('PASS mobile QR create, exchange & session revocation')
}

export async function verifyPasswordResetAndLogout(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const forgot = await requestJson<{ accepted: boolean }>(
    baseUrl,
    '/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ identifier: 'student.demo@silverfour.edu' }),
    },
  )
  assert.equal(forgot.status, 200)
  assert.equal(forgot.body.data?.accepted, true)
  console.log('PASS POST /auth/forgot-password')

  const logout = await requestJson<{ loggedOut: boolean }>(baseUrl, '/auth/logout', {
    method: 'POST',
    headers: authHeaders,
  })
  assert.equal(logout.status, 200)
  assert.equal(logout.body.data?.loggedOut, true)

  const afterLogout = await requestJson(baseUrl, '/auth/me', { headers: authHeaders })
  assert.equal(afterLogout.status, 401)
  console.log('PASS POST /auth/logout invalidates token')
}
