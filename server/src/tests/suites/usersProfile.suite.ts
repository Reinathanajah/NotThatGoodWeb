import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifyUserProfileAndLanguage(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const profile = await requestJson<{
    username: string
    city: string
    preferredLang: string
    loginActivity: { firstAccessAt: string | null; accountAgeSeconds: number | null }
    storage: { quotaBytes: number; usedBytes: number; remainingBytes: number }
  }>(baseUrl, '/users/me/profile', { headers: authHeaders })
  assert.equal(profile.status, 200)
  assert.equal(profile.body.data?.username, 'student.demo')
  assert.equal(profile.body.data?.storage.quotaBytes, 2_147_483_648)
  assert.ok((profile.body.data?.storage.usedBytes ?? 0) > 0)
  assert.ok((profile.body.data?.loginActivity.accountAgeSeconds ?? 0) > 0)
  console.log('PASS GET /users/me/profile')

  const emptyPatch = await requestJson(baseUrl, '/users/me/profile', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({}),
  })
  assert.equal(emptyPatch.status, 400)

  const badTz = await requestJson(baseUrl, '/users/me/profile', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ timezone: 'Mars/Olympus_Mons' }),
  })
  assert.equal(badTz.status, 400)
  console.log('PASS PATCH /users/me/profile validation checks')

  const updatedProfile = await requestJson<{
    city: string
    preferredLang: string
    emailVisibility: string
  }>(baseUrl, '/users/me/profile', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      city: 'North Campus',
      emailVisibility: 'everyone',
      preferredLang: 'id',
    }),
  })
  assert.equal(updatedProfile.status, 200)
  assert.equal(updatedProfile.body.data?.city, 'North Campus')
  assert.equal(updatedProfile.body.data?.preferredLang, 'id')
  assert.equal(updatedProfile.body.data?.emailVisibility, 'everyone')

  const i18nUserPref = await requestJson<{
    lang: string
    source: string
    strings: { nav: { dashboard: string } }
  }>(baseUrl, '/i18n/strings', { headers: authHeaders })
  assert.equal(i18nUserPref.status, 200)
  assert.equal(i18nUserPref.body.data?.lang, 'id')
  assert.equal(i18nUserPref.body.data?.source, 'user_preference')
  assert.equal(i18nUserPref.body.data?.strings.nav.dashboard, 'Dasbor')

  const restored = await requestJson(baseUrl, '/users/me/profile', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      city: 'Main Campus',
      emailVisibility: 'course_participants',
      preferredLang: 'en',
    }),
  })
  assert.equal(restored.status, 200)
  console.log('PASS PATCH /users/me/profile + user_preference i18n resolution')
}

export async function verifyUserPreferences(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const updatedPrefs = await requestJson<{
    editMode: boolean
    courseOverviewView: string
    courseOverviewPageSize: number
    calendarHiddenScopes: string[]
  }>(baseUrl, '/users/me/preferences', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      editMode: true,
      courseOverviewView: 'card',
      courseOverviewPageSize: 24,
      calendarHiddenScopes: ['site', 'site', 'other'],
    }),
  })
  assert.equal(updatedPrefs.status, 200)
  assert.equal(updatedPrefs.body.data?.editMode, true)
  assert.equal(updatedPrefs.body.data?.courseOverviewView, 'card')
  assert.equal(updatedPrefs.body.data?.courseOverviewPageSize, 24)
  assert.deepEqual(updatedPrefs.body.data?.calendarHiddenScopes, ['site', 'other'])

  const resetPrefs = await requestJson<{
    editMode: boolean
    courseOverviewView: string
    courseOverviewPageSize: number
    calendarHiddenScopes: string[]
  }>(baseUrl, '/users/me/preferences', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ resetToDefault: true }),
  })
  assert.equal(resetPrefs.status, 200)
  assert.equal(resetPrefs.body.data?.editMode, false)
  assert.equal(resetPrefs.body.data?.courseOverviewView, 'list')
  assert.equal(resetPrefs.body.data?.courseOverviewPageSize, 12)
  assert.deepEqual(resetPrefs.body.data?.calendarHiddenScopes, [])
  console.log('PASS PATCH /users/me/preferences + resetToDefault')
}
