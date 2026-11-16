import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifyCourseDetailAndCompletion(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<{ vizModuleId: number; simModuleId: number }> {
  const course102037 = await requestJson<{
    moodleCourseId: number
    summaryHtml: string
    breadcrumbs: Array<{ name: string }>
    enrollment: { groups: Array<{ name: string }> }
    lecturers: Array<{ fullName: string }>
    sections: Array<{
      modules: Array<{
        id: number
        moduleType: string
        title: string
        completionTrackable: boolean
      }>
    }>
  }>(baseUrl, '/courses/102037', { headers: authHeaders })
  assert.equal(course102037.status, 200)
  assert.equal(course102037.body.data?.moodleCourseId, 102037)
  assert.ok(course102037.body.data?.summaryHtml.includes('ModuleXX_Group_FullName'))
  assert.ok(course102037.body.data?.breadcrumbs.some((b) => b.name === 'Faculty of Engineering'))
  assert.ok(course102037.body.data?.enrollment.groups.some((g) => g.name === 'Group 04'))
  assert.ok(course102037.body.data?.lecturers.some((l) => l.fullName === 'Dr. Morgan Chen'))
  assert.equal(course102037.body.data?.sections[0]?.modules.length, 5)
  console.log('PASS GET /courses/102037 (breadcrumbs, group, lecturer, sections)')

  const sections812478 = await requestJson<
    Array<{
      title: string
      modules: Array<{ id: number; title: string; subsectionLabel: string | null }>
    }>
  >(baseUrl, '/courses/812478/sections', { headers: authHeaders })
  assert.equal(sections812478.status, 200)
  const sec10 = sections812478.body.data![0]
  assert.equal(sec10.title, 'Topic 10: Multiobjective Least Squares')
  assert.equal(sec10.modules.length, 6)
  assert.ok(sec10.modules.every((m) => m.subsectionLabel === 'Asynchronous'))
  const vizModule = sec10.modules.find((m) => m.title === 'Linear-Multiobj-LS-visualization')!
  const simModule = sec10.modules.find((m) => m.title === 'Linear-Multiobj-LS-simulation')!
  assert.ok(vizModule && simModule)
  console.log('PASS GET /courses/812478/sections (Asynchronous modules)')

  const labelMod = course102037.body.data!.sections[0].modules.find(
    (m) => !m.completionTrackable,
  )!
  const pdfMod = course102037.body.data!.sections[0].modules.find(
    (m) => m.moduleType === 'resource' && m.title.includes('Module 1'),
  )!

  const badComplete = await requestJson(
    baseUrl,
    `/courses/102037/modules/${labelMod.id}/complete`,
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(badComplete.status, 400)

  const completed = await requestJson<{
    isCompleted: boolean
    courseCompletion: { completedModules: number }
  }>(baseUrl, `/courses/102037/modules/${pdfMod.id}/complete`, {
    method: 'POST',
    headers: authHeaders,
  })
  assert.equal(completed.status, 200)
  assert.equal(completed.body.data?.isCompleted, true)
  assert.ok(completed.body.data!.courseCompletion.completedModules >= 1)

  const uncompleted = await requestJson<{ isCompleted: boolean }>(
    baseUrl,
    `/courses/102037/modules/${pdfMod.id}/complete`,
    { method: 'DELETE', headers: authHeaders },
  )
  assert.equal(uncompleted.status, 200)
  assert.equal(uncompleted.body.data?.isCompleted, false)
  console.log('PASS POST & DELETE /courses/:id/modules/:moduleId/complete')

  return { vizModuleId: vizModule.id, simModuleId: simModule.id }
}
