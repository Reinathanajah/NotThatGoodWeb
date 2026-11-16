import { db } from '../index.js'
import {
  courseAccessLogs,
  courseGroupMembers,
  courseGroups,
  courses,
  enrollments,
} from '../schema.js'
import { buildArchiveCourses } from './coursesArchive.js'
import { buildActiveTermCourses } from './coursesCurrent.js'

export async function seedCoursesAndEnrollments(input: {
  eceCategoryId: number
  ceCategoryId: number
  termMap: Map<string, number>
  studentId: string
  netLecturerId: string
}) {
  const insertedCourses = await db
    .insert(courses)
    .values([
      ...buildArchiveCourses(input.ceCategoryId, input.termMap),
      ...buildActiveTermCourses(
        input.eceCategoryId,
        input.ceCategoryId,
        input.termMap,
      ),
    ])
    .returning()

  const byMoodleId = new Map(insertedCourses.map((c) => [c.moodleCourseId, c]))

  for (const course of insertedCourses) {
    await db
      .insert(enrollments)
      .values([
        { userId: input.studentId, courseId: course.id, role: 'student' },
        { userId: input.netLecturerId, courseId: course.id, role: 'lecturer' },
      ])
      .onConflictDoNothing()
  }

  const netCourse = byMoodleId.get(102037)!
  const probCourse = byMoodleId.get(102040)!
  const archCourse = byMoodleId.get(102039)!
  const optCourse = byMoodleId.get(812478)!

  await db
    .insert(courseAccessLogs)
    .values([
      {
        userId: input.studentId,
        courseId: netCourse.id,
        lastAccessedAt: new Date('2026-11-16T22:52:00+07:00'),
      },
      {
        userId: input.studentId,
        courseId: probCourse.id,
        lastAccessedAt: new Date('2026-11-16T22:20:00+07:00'),
      },
      {
        userId: input.studentId,
        courseId: archCourse.id,
        lastAccessedAt: new Date('2026-11-16T22:10:00+07:00'),
      },
      {
        userId: input.studentId,
        courseId: optCourse.id,
        lastAccessedAt: new Date('2026-11-16T22:05:00+07:00'),
      },
    ])
    .onConflictDoNothing()

  const [labGroup] = await db
    .insert(courseGroups)
    .values({ courseId: netCourse.id, name: 'Group 04' })
    .returning()
  await db
    .insert(courseGroupMembers)
    .values({ groupId: labGroup.id, userId: input.studentId })
    .onConflictDoNothing()

  return { byMoodleId, labGroup }
}
