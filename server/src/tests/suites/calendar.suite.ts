import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifyCalendarEventsFlow(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const novCal = await requestJson<{
    scopeLegend: Array<{ scope: string }>
    events: Array<{ id: string; scope: string }>
  }>(baseUrl, '/calendar/events?view=month&year=2026&month=11', { headers: authHeaders })
  assert.equal(novCal.status, 200)
  assert.equal(novCal.body.data?.scopeLegend.length, 6)
  assert.ok((novCal.body.data?.events.length ?? 0) >= 8)
  assert.ok(novCal.body.data?.events.some((e) => e.scope === 'group'))
  assert.ok(novCal.body.data?.events.some((e) => e.scope === 'user'))

  const courseEvent = novCal.body.data!.events.find((e) => e.scope === 'course')!
  assert.ok(courseEvent)

  const courseCal = await requestJson<{ events: Array<{ title: string }> }>(
    baseUrl,
    '/calendar/events?view=month&year=2026&month=11&courseId=102037',
    { headers: authHeaders },
  )
  assert.equal(courseCal.status, 200)
  assert.ok((courseCal.body.data?.events.length ?? 0) >= 2)

  await requestJson(baseUrl, '/users/me/preferences', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ calendarHiddenScopes: ['user'] }),
  })
  const hiddenCal = await requestJson<{ events: Array<{ scope: string }> }>(
    baseUrl,
    '/calendar/events?view=month&year=2026&month=11',
    { headers: authHeaders },
  )
  assert.equal(hiddenCal.body.data?.events.some((e) => e.scope === 'user'), false)

  await requestJson(baseUrl, '/users/me/preferences', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ calendarHiddenScopes: [] }),
  })

  const forbiddenEvent = await requestJson(baseUrl, '/calendar/events', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Unauthorized Site Event',
      scope: 'site',
      startAt: '2026-11-25T10:00:00+07:00',
    }),
  })
  assert.equal(forbiddenEvent.status, 403)

  const personalEvent = await requestJson<{ id: string; scope: string }>(
    baseUrl,
    '/calendar/events',
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Wave 9 Independent Study',
        scope: 'user',
        startAt: '2026-11-25T19:00:00+07:00',
        endAt: '2026-11-25T21:00:00+07:00',
      }),
    },
  )
  assert.equal(personalEvent.status, 201)
  assert.equal(personalEvent.body.data?.scope, 'user')

  assert.equal(
    (
      await requestJson(baseUrl, `/calendar/events/${courseEvent.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await requestJson(baseUrl, `/calendar/events/${personalEvent.body.data!.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
    ).status,
    200,
  )
  console.log('PASS calendar events (month, courseId, hidden scopes, create/delete guards)')
}
