import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifyCourseOverviewAndPreferences(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const page1 = await requestJson<Array<{ id: number }>>(
    baseUrl,
    '/courses/my?page=1&limit=12',
    { headers: authHeaders },
  )
  assert.equal(page1.status, 200)
  assert.equal(page1.body.data?.length, 12)

  const allCourses = await requestJson<
    Array<{
      id: number
      shortName: string
      completion: { percentage: number | null }
    }>
  >(baseUrl, '/courses/my?limit=0', { headers: authHeaders })
  assert.equal(allCourses.status, 200)
  assert.equal(allCourses.body.data?.length, 15)

  const algCourse = allCourses.body.data!.find((c) => c.shortName === 'Algorithms 101')!
  const secCourse = allCourses.body.data!.find((c) => c.shortName === 'Network Security 01')!
  assert.equal(algCourse.completion.percentage, 71)
  assert.equal(secCourse.completion.percentage, 6)
  console.log('PASS GET /courses/my (pagination, limit=0, completion 71% & 6%)')

  assert.equal(
    (
      await requestJson(baseUrl, '/courses/102037/preference', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({}),
      })
    ).status,
    400,
  )
  assert.equal(
    (
      await requestJson(baseUrl, '/courses/999999/preference', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isStarred: true }),
      })
    ).status,
    404,
  )

  const starred = await requestJson<{ isStarred: boolean }>(
    baseUrl,
    '/courses/102037/preference',
    {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ isStarred: true }),
    },
  )
  assert.equal(starred.status, 200)
  assert.equal(starred.body.data?.isStarred, true)

  const starredList = await requestJson<Array<{ moodleCourseId: number | null }>>(
    baseUrl,
    '/courses/my?filter=starred',
    { headers: authHeaders },
  )
  assert.ok(starredList.body.data?.some((c) => c.moodleCourseId === 102037))

  const hidden = await requestJson<{ isHidden: boolean }>(
    baseUrl,
    '/courses/102037/preference',
    {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ isHidden: true }),
    },
  )
  assert.equal(hidden.status, 200)
  assert.equal(hidden.body.data?.isHidden, true)

  const hiddenList = await requestJson<Array<{ moodleCourseId: number | null }>>(
    baseUrl,
    '/courses/my?filter=hidden',
    { headers: authHeaders },
  )
  assert.ok(hiddenList.body.data?.some((c) => c.moodleCourseId === 102037))

  await requestJson(baseUrl, '/courses/102037/preference', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ isStarred: false, isHidden: false }),
  })
  console.log('PASS PATCH /courses/:id/preference (star, hide, restore, validation)')

  const accessRes = await requestJson<{ courseId: number }>(
    baseUrl,
    `/courses/${algCourse.id}/access`,
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(accessRes.status, 200)

  const recent = await requestJson<Array<{ id: number }>>(
    baseUrl,
    '/courses/recent?limit=3',
    { headers: authHeaders },
  )
  assert.equal(recent.status, 200)
  assert.equal(recent.body.data?.[0]?.id, algCourse.id)
  console.log('PASS POST /courses/:id/access + GET /courses/recent')
}
