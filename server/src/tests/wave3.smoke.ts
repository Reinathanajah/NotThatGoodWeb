import assert from 'node:assert/strict'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'

void withTestServer('Wave 3', async (baseUrl) => {
  const tree = await requestJson<
    Array<{ id: number; name: string; children: Array<{ id: number; name: string }> }>
  >(baseUrl, '/categories?view=tree')
  assert.equal(tree.status, 200)
  assert.equal(tree.body.data?.[0]?.name, 'University Catalog')
  assert.equal(tree.body.data?.[0]?.children.length, 17)
  console.log('PASS GET /categories?view=tree (17 faculties/programs)')

  const flatDepth1 = await requestJson<Array<{ id: number; slug: string }>>(
    baseUrl,
    '/categories?view=flat&depth=1',
  )
  assert.equal(flatDepth1.status, 200)
  assert.equal(flatDepth1.body.data?.length, 18)
  const engCategory = flatDepth1.body.data!.find((c) => c.slug === 'engineering')!
  const medCategory = flatDepth1.body.data!.find((c) => c.slug === 'medicine')!
  assert.ok(engCategory && medCategory)
  console.log('PASS GET /categories?view=flat&depth=1')

  const sciDetail = await requestJson<{
    category: { name: string; moodleCategoryId: number }
    ancestors: Array<{ name: string }>
  }>(baseUrl, '/categories/1401')
  assert.equal(sciDetail.status, 200)
  assert.equal(sciDetail.body.data?.category.name, 'Faculty of Science & Mathematics')
  assert.equal(sciDetail.body.data?.ancestors[0]?.name, 'University Catalog')

  const medDetail = await requestJson<{ children: Array<{ name: string }> }>(
    baseUrl,
    `/categories/${medCategory.id}`,
  )
  assert.equal(medDetail.status, 200)
  assert.equal(medDetail.body.data?.children.length, 8)
  console.log('PASS GET /categories/:id (moodleCategoryId=1401 & Medicine subcategories)')

  assert.equal((await requestJson(baseUrl, '/categories/not-a-number')).status, 400)
  assert.equal((await requestJson(baseUrl, '/categories/999999')).status, 404)
  console.log('PASS GET /categories validation (400 & 404)')

  const engCourses = await requestJson<Array<{ id: number; title: string }>>(
    baseUrl,
    `/categories/${engCategory.id}/courses?includeSubcategories=true&page=1&limit=5`,
  )
  assert.equal(engCourses.status, 200)
  assert.equal(engCourses.body.data?.length, 5)
  const pagination = engCourses.body.meta?.pagination as { total: number }
  assert.ok(pagination.total >= 10)

  const engFiltered = await requestJson<Array<{ title: string }>>(
    baseUrl,
    `/categories/${engCategory.id}/courses?search=Telecommunication`,
  )
  assert.equal(engFiltered.status, 200)
  assert.ok(engFiltered.body.data!.some((c) => c.title.includes('Telecommunication Networks')))
  console.log('PASS GET /categories/:id/courses (subcategories, pagination, search)')

  const login = await loginAccount(baseUrl, 'student.demo')

  const enrolledCatCourses = await requestJson<Array<{ isEnrolled: boolean }>>(
    baseUrl,
    `/categories/${engCategory.id}/courses?search=Telecommunication`,
    { headers: login.headers },
  )
  assert.equal(enrolledCatCourses.status, 200)
  assert.ok(enrolledCatCourses.body.data?.some((c) => c.isEnrolled))

  const menus = await requestJson<{
    primary: Array<{ label: string }>
    facultyHomepage: Array<{ href: string }>
    announcements: Array<{ label: string; isHighlightedForRole: boolean }>
  }>(baseUrl, '/navigation/menus', { headers: login.headers })
  assert.equal(menus.status, 200)
  assert.equal(menus.body.data?.primary.length, 3)
  assert.equal(menus.body.data?.facultyHomepage.length, 18)
  assert.ok(
    menus.body.data?.facultyHomepage.some((f) => f.href === '/categories/1401'),
  )
  const instructorBanner = menus.body.data?.announcements.find((a) => a.label.includes('Instructors'))
  assert.ok(instructorBanner)
  assert.equal(instructorBanner.isHighlightedForRole, false)
  console.log('PASS GET /navigation/menus (Faculty Homepage & role-aware banner)')

  assert.equal((await requestJson(baseUrl, '/search?q=')).status, 400)
  const searchRes = await requestJson<{
    counts: { modules: number }
    results: { modules: Array<{ isEnrolled: boolean }> }
  }>(baseUrl, '/search?q=Multiobjective', { headers: login.headers })
  assert.equal(searchRes.status, 200)
  assert.ok(searchRes.body.data!.counts.modules >= 2)
  assert.ok(searchRes.body.data!.results.modules.every((m) => m.isEnrolled))

  const pageSearch = await requestJson<{ results: { pages: Array<{ slug: string }> } }>(
    baseUrl,
    '/search?q=Role&scope=pages',
  )
  assert.equal(pageSearch.status, 200)
  assert.ok(pageSearch.body.data!.results.pages.some((p) => p.slug === 'role_guides'))
  console.log('PASS GET /search (validation, enrolled modules, pages scope)')

  await logoutAccount(baseUrl, login.headers)
})
