import { db } from '../index.js'
import {
  assignments,
  courseModules,
  courseSections,
  quizzes,
  resources,
} from '../schema.js'

const ACADEMIC_INTEGRITY_STATEMENT = [
  '1. All submitted coursework, papers, and reports are my own original work, contain no plagiarism, and follow SilverFour academic integrity and AI usage guidelines.',
  '2. Should any violation be discovered later, I accept full responsibility and any disciplinary measures under applicable institutional policy.',
].join('\n')

export async function seedOptimizationActivities(input: {
  optimizationCourseId: number
  vizPdfFileId: string
  simHtmlFileId: string
}) {
  const [sec10] = await db
    .insert(courseSections)
    .values({
      courseId: input.optimizationCourseId,
      title: 'Topic 10: Multiobjective Least Squares',
      position: 10,
    })
    .returning()

  const [, mlsMonMod, mlsWedMod, vizResMod, simResMod, postTestMlsMod] = await db
    .insert(courseModules)
    .values([
      {
        courseId: input.optimizationCourseId,
        sectionId: sec10.id,
        moduleType: 'url',
        title: 'Lecture Video 1',
        subsectionLabel: 'Asynchronous',
        externalUrl: 'https://video.silverfour.edu/courses/optimization/lecture-01',
        position: 1,
      },
      {
        courseId: input.optimizationCourseId,
        sectionId: sec10.id,
        moduleType: 'assign',
        title: 'Multiobjective Least Squares Assignment (Monday)',
        subsectionLabel: 'Asynchronous',
        position: 2,
        opensAt: new Date('2026-11-09T13:00:00+07:00'),
        dueOrClosedAt: new Date('2026-11-16T13:00:00+07:00'),
      },
      {
        moodleModuleId: 3209504,
        courseId: input.optimizationCourseId,
        sectionId: sec10.id,
        moduleType: 'assign',
        title: 'Multiobjective Least Squares Assignment (Wednesday)',
        subsectionLabel: 'Asynchronous',
        descriptionHtml: '<p>Complete textbook problems:</p><p>15.2</p><p>15.7</p>',
        position: 3,
        opensAt: new Date('2026-11-11T13:00:00+07:00'),
        dueOrClosedAt: new Date('2026-11-18T13:00:00+07:00'),
      },
      {
        courseId: input.optimizationCourseId,
        sectionId: sec10.id,
        moduleType: 'resource',
        title: 'Linear-Multiobj-LS-visualization',
        subsectionLabel: 'Asynchronous',
        position: 4,
      },
      {
        courseId: input.optimizationCourseId,
        sectionId: sec10.id,
        moduleType: 'resource',
        title: 'Linear-Multiobj-LS-simulation',
        subsectionLabel: 'Asynchronous',
        position: 5,
      },
      {
        courseId: input.optimizationCourseId,
        sectionId: sec10.id,
        moduleType: 'quiz',
        title: 'Post Test MLS (Monday)',
        subsectionLabel: 'Asynchronous',
        position: 6,
        opensAt: new Date('2026-11-09T14:30:00+07:00'),
        dueOrClosedAt: new Date('2026-11-09T14:45:00+07:00'),
      },
    ])
    .returning()

  await db.insert(assignments).values([
    {
      moduleId: mlsMonMod.id,
      opensAt: new Date('2026-11-09T13:00:00+07:00'),
      dueAt: new Date('2026-11-16T13:00:00+07:00'),
      requireSubmissionStatement: true,
      submissionStatementText: ACADEMIC_INTEGRITY_STATEMENT,
      plagiarismProvider: 'compilatio',
    },
    {
      moduleId: mlsWedMod.id,
      opensAt: new Date('2026-11-11T13:00:00+07:00'),
      dueAt: new Date('2026-11-18T13:00:00+07:00'),
      requireSubmissionStatement: true,
      submissionStatementText: ACADEMIC_INTEGRITY_STATEMENT,
      plagiarismProvider: 'compilatio',
    },
  ])

  await db.insert(resources).values([
    { moduleId: vizResMod.id, fileObjectId: input.vizPdfFileId, resourceKind: 'pdf' },
    { moduleId: simResMod.id, fileObjectId: input.simHtmlFileId, resourceKind: 'html' },
  ])

  await db.insert(quizzes).values({
    moduleId: postTestMlsMod.id,
    opensAt: new Date('2026-11-09T14:30:00+07:00'),
    closedAt: new Date('2026-11-09T14:45:00+07:00'),
    timeLimitSeconds: 900,
    maxAttempts: 1,
    maxGrade: '100.00',
    questionsJson: [
      {
        id: 'mls-1',
        prompt: 'In multiobjective least squares, how is the combined objective function formed?',
        options: [
          'Weighted sum of squared norms',
          'Product of single inverse matrices',
          'Jacobian determinant',
          'Fourier elimination',
        ],
        correctIndex: 0,
        points: 100,
        tag: 'Multiobjective-LS',
      },
    ],
  })

  return { mlsWedMod }
}
