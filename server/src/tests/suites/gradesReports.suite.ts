import assert from 'node:assert/strict'
import { db } from '../../db/index.js'
import { gradeItems, grades } from '../../db/schema.js'
import { requestJson } from '../helpers/http.js'

export async function verifyGradesOverviewAndCourseBook(
  baseUrl: string,
  authHeaders: Record<string, string>,
  adminHeaders: Record<string, string>,
  studentId: string,
): Promise<{ visibleGradeItemId: number; tempHiddenItemId: number }> {
  const overview = await requestJson<{
    title: string
    courses: Array<{ formattedGrade: string }>
  }>(baseUrl, '/grades/overview', { headers: authHeaders })
  assert.equal(overview.status, 200)
  assert.equal(overview.body.data?.title, 'Courses I am taking')
  assert.ok((overview.body.data?.courses.length ?? 0) >= 7)
  assert.ok(overview.body.data?.courses.every((c) => c.formattedGrade === '-'))

  assert.equal(
    (await requestJson(baseUrl, '/courses/812679/grades', { headers: adminHeaders })).status,
    403,
  )

  const courseGrades = await requestJson<{
    course: { id: number }
    courseTotal: { formattedGrade: string }
    items: Array<{ id: number }>
  }>(baseUrl, '/courses/812679/grades', { headers: authHeaders })
  assert.equal(courseGrades.status, 200)
  assert.equal(courseGrades.body.data?.courseTotal.formattedGrade, '-')
  assert.ok((courseGrades.body.data?.items.length ?? 0) >= 1)
  const visibleGradeItemId = courseGrades.body.data!.items[0].id

  const [hiddenItem] = await db
    .insert(gradeItems)
    .values({
      courseId: courseGrades.body.data!.course.id,
      name: 'Hidden Bonus Quiz Wave 10',
      maxGrade: '100.00',
      weight: '2.00',
      isHiddenFromStudents: true,
    })
    .returning()

  await db.insert(grades).values([
    { gradeItemId: visibleGradeItemId, userId: studentId, score: '87.50' },
    { gradeItemId: hiddenItem.id, userId: studentId, score: '10.00' },
  ])

  const updatedCourseGrades = await requestJson<{
    courseTotal: { formattedGrade: string; letterGrade: string | null }
    items: Array<{ id: number }>
  }>(baseUrl, '/courses/812679/grades', { headers: authHeaders })
  assert.equal(updatedCourseGrades.status, 200)
  assert.equal(
    updatedCourseGrades.body.data?.items.some((i) => i.id === hiddenItem.id),
    false,
  )
  assert.equal(updatedCourseGrades.body.data?.courseTotal.formattedGrade, '87.50')
  assert.equal(updatedCourseGrades.body.data?.courseTotal.letterGrade, 'A')

  const updatedOverview = await requestJson<{
    courses: Array<{ formattedGrade: string }>
  }>(baseUrl, '/grades/overview?search=812679', { headers: authHeaders })
  assert.equal(updatedOverview.status, 200)
  assert.equal(updatedOverview.body.data?.courses[0]?.formattedGrade, '87.50')
  console.log('PASS grades overview, course gradebook & hidden-item exclusion')

  return { visibleGradeItemId, tempHiddenItemId: hiddenItem.id }
}

export async function verifyLearnerScriptReports(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<void> {
  const reportList = await requestJson<{
    canManageReports: boolean
    reports: Array<{ key: string }>
  }>(baseUrl, '/reports/learner-script', { headers: authHeaders })
  assert.equal(reportList.status, 200)
  assert.equal(reportList.body.data?.canManageReports, false)
  assert.ok(reportList.body.data?.reports.some((r) => r.key === 'student-progress'))
  assert.ok(reportList.body.data?.reports.some((r) => r.key === 'quiz-tagging'))

  const progressReport = await requestJson<{ rows: Array<{ moodleCourseId: number }> }>(
    baseUrl,
    '/reports/learner-script/student-progress?courseId=102038',
    { headers: authHeaders },
  )
  assert.equal(progressReport.status, 200)
  assert.equal(progressReport.body.data?.rows.length, 1)
  assert.equal(progressReport.body.data?.rows[0].moodleCourseId, 102038)

  const quizTagReport = await requestJson<{ rows: Array<{ tag: string }> }>(
    baseUrl,
    '/reports/learner-script/quiz-tagging',
    { headers: authHeaders },
  )
  assert.equal(quizTagReport.status, 200)
  assert.ok(quizTagReport.body.data?.rows.some((r) => r.tag === 'OSI-Layer'))
  assert.equal(JSON.stringify(quizTagReport.body.data).includes('correctIndex'), false)

  assert.equal(
    (await requestJson(baseUrl, '/reports/learner-script/unknown-key', { headers: authHeaders }))
      .status,
    404,
  )
  console.log('PASS LearnerScript reports (catalog, student-progress, quiz-tagging)')
}
