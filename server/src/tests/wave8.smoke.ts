import assert from 'node:assert/strict'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  courseModules,
  courses,
  courseSections,
  enrollments,
  gradeItems,
  quizzes,
} from '../db/schema.js'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import {
  verifyClosedQuizGuard,
  verifyQuizAttemptLifecycle,
} from './suites/quizzesFlow.suite.js'

void withTestServer('Wave 8', async (baseUrl) => {
  let tempQuizModuleId: number | null = null
  let tempCourseId: number | null = null
  let studentId: string | null = null
  let authHeaders: Record<string, string> | null = null

  try {
    assert.equal((await requestJson(baseUrl, '/quizzes/1')).status, 401)
    console.log('PASS unauthenticated /quizzes/:moduleId rejected (401)')

    const login = await loginAccount(baseUrl, 'student.demo')
    studentId = login.user.id
    authHeaders = login.headers

    await verifyClosedQuizGuard(baseUrl, authHeaders)

    const [netCourse] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.moodleCourseId, 102037))
      .limit(1)
    const [netSec] = await db
      .select({ id: courseSections.id })
      .from(courseSections)
      .where(eq(courseSections.courseId, netCourse!.id))
      .limit(1)
    assert.ok(netCourse && netSec)
    tempCourseId = netCourse.id

    const now = Date.now()
    const [tempMod] = await db
      .insert(courseModules)
      .values({
        courseId: netCourse.id,
        sectionId: netSec.id,
        moduleType: 'quiz',
        title: 'Wave 8 Timed Quiz Verification',
        position: 99,
        opensAt: new Date(now - 60_000),
        dueOrClosedAt: new Date(now + 1_800_000),
      })
      .returning()
    tempQuizModuleId = tempMod.id

    await db.insert(quizzes).values({
      moduleId: tempMod.id,
      opensAt: new Date(now - 60_000),
      closedAt: new Date(now + 1_800_000),
      timeLimitSeconds: 900,
      maxAttempts: 1,
      maxGrade: '100.00',
      questionsJson: [
        {
          id: 'oq1',
          prompt: 'Which transport protocol is connection-oriented?',
          options: ['UDP', 'TCP', 'ICMP', 'ARP'],
          correctIndex: 1,
          points: 50,
          tag: 'Transport',
        },
        {
          id: 'oq2',
          prompt: 'What is the default port for HTTPS?',
          options: ['80', '22', '443', '53'],
          correctIndex: 2,
          points: 50,
          tag: 'Security',
        },
      ],
    })

    const openDetail = await requestJson<{ windowStatus: string; canStartAttempt: boolean }>(
      baseUrl,
      `/quizzes/${tempMod.id}`,
      { headers: authHeaders },
    )
    assert.equal(openDetail.status, 200)
    assert.equal(openDetail.body.data?.windowStatus, 'open')
    assert.equal(openDetail.body.data?.canStartAttempt, true)

    await verifyQuizAttemptLifecycle(
      baseUrl,
      authHeaders,
      tempMod.id,
      studentId,
      netCourse.id,
    )
  } finally {
    if (tempQuizModuleId !== null) {
      await db.delete(gradeItems).where(eq(gradeItems.moduleId, tempQuizModuleId))
      await db.delete(courseModules).where(eq(courseModules.id, tempQuizModuleId))
    }
    if (tempCourseId !== null && studentId !== null) {
      await db
        .update(enrollments)
        .set({ cachedFinalGrade: null })
        .where(
          and(eq(enrollments.userId, studentId), eq(enrollments.courseId, tempCourseId)),
        )
    }
    if (authHeaders) {
      await logoutAccount(baseUrl, authHeaders)
    }
  }
})
