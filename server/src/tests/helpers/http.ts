import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { createApp } from '../../app.js'
import { pool } from '../../db/index.js'

export interface JsonEnvelope<T = unknown> {
  ok: boolean
  data?: T
  meta?: Record<string, unknown>
  error?: { code: string; message: string }
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
): Promise<{ status: number; headers: Headers; body: JsonEnvelope<T> }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const body = (await response.json()) as JsonEnvelope<T>
  return { status: response.status, headers: response.headers, body }
}

export async function loginAccount<TUser = { id: string; username: string; email: string }>(
  baseUrl: string,
  identifier: string,
  password = 'Password123!',
) {
  const login = await requestJson<{
    accessToken: string
    sessionId: string
    user: TUser
  }>(baseUrl, '/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
  assert.equal(login.status, 200)
  assert.equal(login.body.ok, true)
  const accessToken = login.body.data!.accessToken
  return {
    accessToken,
    sessionId: login.body.data!.sessionId,
    user: login.body.data!.user,
    headers: { Authorization: `Bearer ${accessToken}` },
  }
}

export async function logoutAccount(
  baseUrl: string,
  headers: Record<string, string>,
): Promise<void> {
  await requestJson(baseUrl, '/auth/logout', { method: 'POST', headers })
}

export async function withTestServer(
  label: string,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const app = createApp()
  const server = app.listen(0)

  try {
    const { port } = server.address() as AddressInfo
    await run(`http://127.0.0.1:${port}/api/v1`)
    console.log(`\nAll ${label} smoke tests passed.`)
  } catch (err) {
    console.error(`${label} smoke test failed:`, err)
    process.exitCode = 1
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await pool.end()
  }
}
