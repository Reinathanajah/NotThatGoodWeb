import { db } from '../index.js'
import { assignments, courseModules, courseSections } from '../schema.js'

export async function seedLabAndArchActivities(input: {
  networksLabCourseId: number
  archCourseId: number
}) {
  const [labSec6] = await db
    .insert(courseSections)
    .values({ courseId: input.networksLabCourseId, title: 'Topic 6', position: 6 })
    .returning()

  const [preLabMod, cs2Mod, suppLabMod] = await db
    .insert(courseModules)
    .values([
      {
        courseId: input.networksLabCourseId,
        sectionId: labSec6.id,
        moduleType: 'assign',
        title: 'Pre-Lab Assignment Module 2',
        position: 1,
        opensAt: new Date('2026-11-14T08:00:00+07:00'),
        dueOrClosedAt: new Date('2026-11-16T23:55:00+07:00'),
      },
      {
        moodleModuleId: 3213297,
        courseId: input.networksLabCourseId,
        sectionId: labSec6.id,
        moduleType: 'assign',
        title: 'Case Study Submission Module 2',
        position: 2,
        opensAt: new Date('2026-11-17T10:00:00+07:00'),
        dueOrClosedAt: new Date('2026-11-17T23:55:00+07:00'),
      },
      {
        courseId: input.networksLabCourseId,
        sectionId: labSec6.id,
        moduleType: 'assign',
        title: 'Supplementary Lab Assignment Module 2',
        position: 3,
        opensAt: new Date('2026-11-17T20:00:00+07:00'),
        dueOrClosedAt: new Date('2026-11-19T23:55:00+07:00'),
      },
    ])
    .returning()

  await db.insert(assignments).values([
    {
      moduleId: preLabMod.id,
      opensAt: new Date('2026-11-14T08:00:00+07:00'),
      dueAt: new Date('2026-11-16T23:55:00+07:00'),
    },
    {
      moduleId: cs2Mod.id,
      opensAt: new Date('2026-11-17T10:00:00+07:00'),
      dueAt: new Date('2026-11-17T23:55:00+07:00'),
    },
    {
      moduleId: suppLabMod.id,
      opensAt: new Date('2026-11-17T20:00:00+07:00'),
      dueAt: new Date('2026-11-19T23:55:00+07:00'),
    },
  ])

  const [archSec1] = await db
    .insert(courseSections)
    .values({ courseId: input.archCourseId, title: 'Module 1 - Architecture Fundamentals', position: 1 })
    .returning()

  const [archMod1] = await db
    .insert(courseModules)
    .values({
      courseId: input.archCourseId,
      sectionId: archSec1.id,
      moduleType: 'assign',
      title: 'Case Study Submission Module 1',
      position: 1,
      opensAt: new Date('2026-11-09T09:00:00+07:00'),
      dueOrClosedAt: new Date('2026-11-16T09:50:00+07:00'),
    })
    .returning()

  await db.insert(assignments).values({
    moduleId: archMod1.id,
    opensAt: new Date('2026-11-09T09:00:00+07:00'),
    dueAt: new Date('2026-11-16T09:50:00+07:00'),
  })

  return { cs2Mod, archMod1 }
}
