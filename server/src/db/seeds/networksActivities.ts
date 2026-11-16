import { db } from '../index.js'
import { courseModules, courseSections, quizzes, resources } from '../schema.js'

export async function seedNetworksActivities(input: {
  networksCourseId: number
  module1FileId: string
  briefingFileId: string
}) {
  const [week1Sec] = await db
    .insert(courseSections)
    .values({
      courseId: input.networksCourseId,
      title: 'WEEK 1 - INTRODUCTION TO TELECOMMUNICATION NETWORKS (SEP 21 - 25, 2026)',
      position: 1,
      weekStart: new Date('2026-09-21T00:00:00+07:00'),
      weekEnd: new Date('2026-09-25T23:59:59+07:00'),
    })
    .returning()

  const [mod1, , briefingMod, , pretestMod] = await db
    .insert(courseModules)
    .values([
      {
        courseId: input.networksCourseId,
        sectionId: week1Sec.id,
        moduleType: 'resource',
        title: 'Module 1 - Introduction to Telecommunication Networks',
        position: 1,
      },
      {
        courseId: input.networksCourseId,
        sectionId: week1Sec.id,
        moduleType: 'label',
        title: 'Briefing & Pre-Test Session Schedule',
        descriptionHtml:
          '<p>The briefing and pre-test session will run concurrently on Friday, September 25, 2026, from 19:00 to 20:30 via online video meeting.</p>',
        position: 2,
        completionTrackable: false,
      },
      {
        courseId: input.networksCourseId,
        sectionId: week1Sec.id,
        moduleType: 'resource',
        title: 'Telecomm Briefing Slides',
        position: 3,
      },
      {
        courseId: input.networksCourseId,
        sectionId: week1Sec.id,
        moduleType: 'url',
        title: 'Live Briefing Room',
        externalUrl: 'https://meet.silverfour.edu/rooms/network-systems-session',
        position: 4,
      },
      {
        courseId: input.networksCourseId,
        sectionId: week1Sec.id,
        moduleType: 'quiz',
        title: 'Pre-Test Telecommunication Networks Lab 2026/2027',
        position: 5,
        opensAt: new Date('2026-09-25T19:25:00+07:00'),
        dueOrClosedAt: new Date('2026-09-25T20:05:00+07:00'),
      },
    ])
    .returning()

  await db.insert(resources).values([
    { moduleId: mod1.id, fileObjectId: input.module1FileId, resourceKind: 'pdf' },
    { moduleId: briefingMod.id, fileObjectId: input.briefingFileId, resourceKind: 'pdf' },
  ])

  await db.insert(quizzes).values({
    moduleId: pretestMod.id,
    opensAt: new Date('2026-09-25T19:25:00+07:00'),
    closedAt: new Date('2026-09-25T20:05:00+07:00'),
    timeLimitSeconds: 2400,
    maxAttempts: 1,
    maxGrade: '100.00',
    questionsJson: [
      {
        id: 'q1',
        prompt: 'Which OSI model layer is responsible for routing packets across networks?',
        options: ['Physical', 'Data Link', 'Network', 'Transport'],
        correctIndex: 2,
        points: 50,
        tag: 'OSI-Layer',
      },
      {
        id: 'q2',
        prompt: 'What is the standard unit of bit rate per second in digital transmission?',
        options: ['Hertz', 'bps', 'Decibel', 'Ohm'],
        correctIndex: 1,
        points: 50,
        tag: 'Transmission',
      },
    ],
  })
}
