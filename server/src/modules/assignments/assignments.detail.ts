import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  assignmentSubmissionFiles,
  fileObjects,
  gradeItems,
  grades,
  plagiarismJobs,
  submissionComments,
} from '../../db/schema.js'
import { getCategoryBreadcrumbs } from '../categories/categories.service.js'
import { resolveAdjacentModules } from '../courses/courses.service.js'
import { getLatestSubmission, loadAuthorizedAssignment } from './assignments.access.js'
import { computeTimeRemaining } from './assignments.time.js'

export async function getAssignmentDetail(userId: string, rawModuleId: number) {
  const { mod, course, assignRow, sectionRow } = await loadAuthorizedAssignment(
    userId,
    rawModuleId,
  )

  const [submission, breadcrumbs, gradeRow, navigation] = await Promise.all([
    getLatestSubmission(mod.id, userId),
    getCategoryBreadcrumbs(course.categoryId),
    db
      .select({
        score: grades.score,
        feedback: grades.feedback,
        gradedAt: grades.gradedAt,
        maxGrade: gradeItems.maxGrade,
      })
      .from(gradeItems)
      .innerJoin(
        grades,
        and(eq(grades.gradeItemId, gradeItems.id), eq(grades.userId, userId)),
      )
      .where(
        and(
          eq(gradeItems.moduleId, mod.id),
          eq(gradeItems.isHiddenFromStudents, false),
        ),
      )
      .limit(1),
    resolveAdjacentModules(course.id, mod.id),
  ])

  const [attachedFiles, commentRows, plagiarismRows] = await Promise.all([
    submission
      ? db
          .select({
            id: fileObjects.id,
            originalName: fileObjects.originalName,
            displayName: fileObjects.displayName,
            mimeType: fileObjects.mimeType,
            sizeBytes: fileObjects.sizeBytes,
            authorName: fileObjects.authorName,
            license: fileObjects.license,
            uploadedAt: fileObjects.uploadedAt,
            attachedAt: assignmentSubmissionFiles.attachedAt,
          })
          .from(assignmentSubmissionFiles)
          .innerJoin(
            fileObjects,
            eq(assignmentSubmissionFiles.fileObjectId, fileObjects.id),
          )
          .where(eq(assignmentSubmissionFiles.submissionId, submission.id))
          .orderBy(asc(assignmentSubmissionFiles.attachedAt))
      : Promise.resolve([]),
    submission
      ? db
          .select({ id: submissionComments.id })
          .from(submissionComments)
          .where(eq(submissionComments.submissionId, submission.id))
      : Promise.resolve([]),
    submission
      ? db
          .select()
          .from(plagiarismJobs)
          .where(eq(plagiarismJobs.submissionId, submission.id))
          .orderBy(desc(plagiarismJobs.updatedAt))
      : Promise.resolve([]),
  ])

  const gradeInfo = gradeRow[0]
    ? {
        score: gradeRow[0].score,
        maxGrade: gradeRow[0].maxGrade,
        feedback: gradeRow[0].feedback,
        gradedAt: gradeRow[0].gradedAt,
      }
    : null

  return {
    moduleId: mod.id,
    moodleModuleId: mod.moodleModuleId,
    title: mod.title,
    subsectionLabel: mod.subsectionLabel,
    descriptionHtml: mod.descriptionHtml,
    opensAt: assignRow.opensAt,
    dueAt: assignRow.dueAt,
    cutoffAt: assignRow.cutoffAt,
    rules: {
      maxFiles: assignRow.maxFiles,
      maxFileSizeBytes: assignRow.maxFileSizeBytes,
      requireSubmissionStatement: assignRow.requireSubmissionStatement,
      submissionStatementText: assignRow.submissionStatementText,
      plagiarismProvider: assignRow.plagiarismProvider,
      maxAttempts: assignRow.maxAttempts,
      maxGrade: assignRow.maxGrade,
    },
    course: {
      id: course.id,
      moodleCourseId: course.moodleCourseId,
      code: course.code,
      title: course.title,
    },
    section: sectionRow
      ? { id: sectionRow.id, title: sectionRow.title, position: sectionRow.position }
      : null,
    breadcrumbs,
    submissionStatus: {
      submissionId: submission?.id ?? null,
      attemptNumber: submission?.attemptNumber ?? 1,
      status: submission?.status ?? 'none',
      gradingStatus: gradeInfo ? 'graded' : (submission?.gradingStatus ?? 'not_graded'),
      onlineText: submission?.onlineText ?? null,
      declarationAccepted: submission?.declarationAccepted ?? false,
      declarationAcceptedAt: submission?.declarationAcceptedAt ?? null,
      submittedAt: submission?.submittedAt ?? null,
      lastModifiedAt: submission?.lastModifiedAt ?? null,
      timeRemaining: computeTimeRemaining(assignRow.dueAt, submission?.submittedAt ?? null),
      files: attachedFiles,
      commentCount: commentRows.length,
      grade: gradeInfo,
      plagiarismJobs: plagiarismRows,
    },
    navigation,
  }
}
