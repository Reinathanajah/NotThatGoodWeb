import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifyTimelineAndClock(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const timelinePage1 = await requestJson<
    Array<{ moduleId: number; title: string; status: string; course: { title: string } }>
  >(baseUrl, '/dashboard/timeline?offset=0&limit=2', { headers: authHeaders })
  assert.equal(timelinePage1.status, 200)
  assert.equal(timelinePage1.body.data?.length, 2)
  const tlMeta = timelinePage1.body.meta?.pagination as { total: number; hasMore: boolean }
  assert.ok(tlMeta.total >= 5)
  assert.equal(tlMeta.hasMore, true)

  const overdue = await requestJson<Array<{ title: string; status: string }>>(
    baseUrl,
    '/dashboard/timeline?filter=overdue',
    { headers: authHeaders },
  )
  assert.equal(overdue.status, 200)
  assert.ok(
    overdue.body.data?.some(
      (i) => i.title.includes('Case Study Submission Module 1') && i.status === 'overdue',
    ),
  )

  const byCourse = await requestJson<Array<{ course: { title: string } }>>(
    baseUrl,
    '/dashboard/timeline?sort=courses&search=Module',
    { headers: authHeaders },
  )
  assert.equal(byCourse.status, 200)
  assert.ok((byCourse.body.data?.length ?? 0) >= 2)
  console.log('PASS GET /dashboard/timeline (pagination, overdue, sort=courses, search)')

  const clock = await requestJson<{
    server: { timezone: string; offset: string }
    user: { timezone: string; offset: string }
    converted: { timezone: string; offset: string }
  }>(baseUrl, '/clock?targetTimezone=Asia/Tokyo&timestamp=2026-11-16T15:00:00Z', {
    headers: authHeaders,
  })
  assert.equal(clock.status, 200)
  assert.equal(clock.body.data?.server.timezone, 'UTC')
  assert.equal(clock.body.data?.server.offset, '+00:00')
  assert.equal(clock.body.data?.user.timezone, 'UTC')
  assert.equal(clock.body.data?.user.offset, '+00:00')
  assert.equal(clock.body.data?.converted.timezone, 'Asia/Tokyo')
  assert.equal(clock.body.data?.converted.offset, '+09:00')

  const badClock = await requestJson(baseUrl, '/clock?targetTimezone=Invalid/Zone')
  assert.equal(badClock.status, 400)
  console.log('PASS GET /clock (server UTC, user UTC, converter & validation)')
}
