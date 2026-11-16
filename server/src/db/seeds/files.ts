import { db } from '../index.js'
import { fileObjects, privateFiles } from '../schema.js'

export async function seedFileObjects(input: {
  studentId: string
  studentName: string
  lecturerId: string
  lecturerName: string
}) {
  const [modul1File, pptBriefingFile, vizPdfFile, simHtmlFile, privateSampleFile] = await db
    .insert(fileObjects)
    .values([
      {
        ownerUserId: input.lecturerId,
        originalName: 'Module 1 - Introduction to Telecommunication Networks.pdf',
        displayName: 'Module 1 - Introduction to Telecommunication Networks',
        mimeType: 'application/pdf',
        sizeBytes: 13_002_342,
        storageKey: 'courses/102037/module-1-intro-telecomm.pdf',
        authorName: input.lecturerName,
        license: 'all_rights_reserved',
        uploadedAt: new Date('2026-09-22T10:23:00+07:00'),
      },
      {
        ownerUserId: input.lecturerId,
        originalName: 'Telecomm Briefing Slides.pdf',
        displayName: 'Telecomm Briefing Slides',
        mimeType: 'application/pdf',
        sizeBytes: 848_486,
        storageKey: 'courses/102037/telecomm-briefing-slides.pdf',
        authorName: input.lecturerName,
        license: 'all_rights_reserved',
        uploadedAt: new Date('2026-09-25T20:42:00+07:00'),
      },
      {
        ownerUserId: input.lecturerId,
        originalName: 'Linear-Multiobj-LS-visualization.pdf',
        displayName: 'Linear-Multiobj-LS-visualization',
        mimeType: 'application/pdf',
        sizeBytes: 2_726_297,
        storageKey: 'courses/812478/linear-multiobj-ls-visualization.pdf',
        authorName: 'Dr. Taylor Kim',
        license: 'all_rights_reserved',
        uploadedAt: new Date('2026-11-09T13:28:00+07:00'),
      },
      {
        ownerUserId: input.lecturerId,
        originalName: 'Linear-Multiobj-LS-simulation.html',
        displayName: 'Linear-Multiobj-LS-simulation',
        mimeType: 'text/html',
        sizeBytes: 807_628,
        storageKey: 'courses/812478/linear-multiobj-ls-simulation.html',
        authorName: 'Dr. Taylor Kim',
        license: 'all_rights_reserved',
        uploadedAt: new Date('2026-11-09T13:29:00+07:00'),
      },
      {
        ownerUserId: input.studentId,
        originalName: 'Lab_Notes_Networks.pdf',
        displayName: 'Lab_Notes_Networks.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245_760,
        storageKey: 'private/student-demo/lab-notes-networks.pdf',
        authorName: input.studentName,
        license: 'all_rights_reserved',
        uploadedAt: new Date('2026-11-10T19:15:00+07:00'),
      },
    ])
    .returning()

  const [semesterFolder] = await db
    .insert(privateFiles)
    .values({ userId: input.studentId, isFolder: true, name: 'Semester 3' })
    .returning()

  await db.insert(privateFiles).values({
    userId: input.studentId,
    parentFolderId: semesterFolder.id,
    isFolder: false,
    name: privateSampleFile.displayName,
    fileObjectId: privateSampleFile.id,
  })

  return { modul1File, pptBriefingFile, vizPdfFile, simHtmlFile }
}
