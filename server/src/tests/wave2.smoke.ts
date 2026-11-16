import assert from 'node:assert/strict'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import {
  verifyUserPreferences,
  verifyUserProfileAndLanguage,
} from './suites/usersProfile.suite.js'

void withTestServer('Wave 2', async (baseUrl) => {
  const unauth = await requestJson(baseUrl, '/users/me/profile')
  assert.equal(unauth.status, 401)
  console.log('PASS unauthenticated /users/me/profile rejected (401)')

  const login = await loginAccount(baseUrl, 'student.demo')
  await verifyUserProfileAndLanguage(baseUrl, login.headers)
  await verifyUserPreferences(baseUrl, login.headers)

  const i18nQuery = await requestJson<{
    lang: string
    source: string
    availableLanguages: Array<{ code: string; label: string }>
    strings: { nav: { dashboard: string } }
  }>(baseUrl, '/i18n/strings?lang=zh_cn')
  assert.equal(i18nQuery.status, 200)
  assert.equal(i18nQuery.body.data?.lang, 'zh_cn')
  assert.equal(i18nQuery.body.data?.source, 'query')
  assert.equal(i18nQuery.body.data?.strings.nav.dashboard, '仪表盘')
  assert.equal(i18nQuery.body.data?.availableLanguages.length, 3)

  const badLang = await requestJson(baseUrl, '/i18n/strings?lang=fr')
  assert.equal(badLang.status, 400)
  console.log('PASS GET /i18n/strings (zh_cn + validation)')

  const heartbeat = await requestJson<{
    userId: string
    onlineCount: number
    activeWindowSeconds: number
  }>(baseUrl, '/presence/heartbeat', { method: 'POST', headers: login.headers })
  assert.equal(heartbeat.status, 200)
  assert.ok((heartbeat.body.data?.onlineCount ?? 0) >= 1)
  assert.equal(heartbeat.body.data?.activeWindowSeconds, 300)

  const online = await requestJson<{ onlineCount: number; activeWindowSeconds: number }>(
    baseUrl,
    '/presence/online',
  )
  assert.equal(online.status, 200)
  assert.ok((online.body.data?.onlineCount ?? 0) >= 1)
  console.log('PASS POST /presence/heartbeat + GET /presence/online')

  await logoutAccount(baseUrl, login.headers)
})
