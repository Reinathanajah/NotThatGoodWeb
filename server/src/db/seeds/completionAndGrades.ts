import { db } from '../index.js'
import {
  courseModules,
  courseSections,
  gradeItems,
  moduleCompletions,
} from '../schema.js'

export async function seedCompletionsAndGrades(input: {
  studentId: string
  algCourseId: number
  secCourseId: number
  netLabCourseId: number
  optCourseId: number
  cs2ModId: number
  mlsWedModId: number
}) {
  // Algorithms expects 71% completion (5 of 7 modules) matching dashboard fixture.
  const [algSec] = await db
    .insert(courseSections)
    .values({ courseId: input.algCourseId, title: 'Course Materials & Practice', position: 1 })
    .returning()
  const algMods = await db
    .insert(courseModules)
    .values(
      Array.from({ length: 7 }, (_, i) => ({
        courseId: input.algCourseId,
        sectionId: algSec.id,
        moduleType: 'resource' as const,
        title: `Algorithms Practice Module ${i + 1}`,
        position: i + 1,
      })),
    )
    .returning()
  await db
    .insert(moduleCompletions)
    .values(algMods.slice(0, 5).map((m) => ({ userId: input.studentId, moduleId: m.id })))
    .onConflictDoNothing()

  // Network Security expects 6% completion (1 of 16 modules).
  const [secSection] = await db
    .insert(courseSections)
    .values({ courseId: input.secCourseId, title: 'Week 1 - 16', position: 1 })
    .returning()
  const secMods = await db
    .insert(courseModules)
    .values(
      Array.from({ length: 16 }, (_, i) => ({
        courseId: input.secCourseId,
        sectionId: secSection.id,
        moduleType: 'resource' as const,
        title: `Network Security Session ${i + 1}`,
        position: i + 1,
      })),
    )
    .returning()
  await db
    .insert(moduleCompletions)
    .values([{ userId: input.studentId, moduleId: secMods[0].id }])
    .onConflictDoNothing()

  await db.insert(gradeItems).values([
    {
      courseId: input.netLabCourseId,
      moduleId: input.cs2ModId,
      name: 'Case Study Submission Module 2',
      maxGrade: '100.00',
    },
    {
      courseId: input.optCourseId,
      moduleId: input.mlsWedModId,
      name: 'Multiobjective Least Squares Assignment (Wednesday)',
      maxGrade: '100.00',
    },
  ])
}
