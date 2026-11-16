import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  courseSections,
  fileObjects,
  moduleCompletions,
  resources,
} from '../../db/schema.js'
import { NotFoundError } from '../../utils/errors.js'
import { readFileObjectBytes } from '../../utils/storage.js'
import {
  requireEnrolledCourse,
  resolveAdjacentModules,
  resolveCourseModuleByIdOrMoodleId,
} from '../courses/courses.service.js'

async function loadAuthorizedResource(userId: string, rawModuleId: number) {
  const mod = await resolveCourseModuleByIdOrMoodleId(rawModuleId)
  if (!mod.visible || mod.moduleType !== 'resource') {
    throw new NotFoundError('Resource module not found')
  }

  const { course } = await requireEnrolledCourse(userId, mod.courseId)

  const [[resourceRow], [sectionRow], [completionRow], navigation] = await Promise.all([
    db
      .select({
        resourceKind: resources.resourceKind,
        displayMode: resources.displayMode,
        file: {
          id: fileObjects.id,
          originalName: fileObjects.originalName,
          displayName: fileObjects.displayName,
          mimeType: fileObjects.mimeType,
          sizeBytes: fileObjects.sizeBytes,
          storageKey: fileObjects.storageKey,
          authorName: fileObjects.authorName,
          license: fileObjects.license,
          uploadedAt: fileObjects.uploadedAt,
        },
      })
      .from(resources)
      .leftJoin(fileObjects, eq(resources.fileObjectId, fileObjects.id))
      .where(eq(resources.moduleId, mod.id))
      .limit(1),
    db
      .select({ id: courseSections.id, title: courseSections.title, position: courseSections.position })
      .from(courseSections)
      .where(eq(courseSections.id, mod.sectionId))
      .limit(1),
    db
      .select({ completedAt: moduleCompletions.completedAt })
      .from(moduleCompletions)
      .where(
        and(
          eq(moduleCompletions.userId, userId),
          eq(moduleCompletions.moduleId, mod.id),
        ),
      )
      .limit(1),
    resolveAdjacentModules(course.id, mod.id),
  ])

  if (!resourceRow) {
    throw new NotFoundError('Resource metadata not found')
  }

  return { mod, course, resourceRow, sectionRow, completionRow, navigation }
}

export async function getResourceDetail(userId: string, rawModuleId: number) {
  const { mod, course, resourceRow, sectionRow, completionRow, navigation } =
    await loadAuthorizedResource(userId, rawModuleId)

  return {
    moduleId: mod.id,
    moodleModuleId: mod.moodleModuleId,
    title: mod.title,
    subsectionLabel: mod.subsectionLabel,
    descriptionHtml: mod.descriptionHtml,
    resourceKind: resourceRow.resourceKind,
    displayMode: resourceRow.displayMode,
    isCompleted: Boolean(completionRow),
    completedAt: completionRow?.completedAt ?? null,
    course: {
      id: course.id,
      moodleCourseId: course.moodleCourseId,
      code: course.code,
      title: course.title,
    },
    section: sectionRow ?? null,
    file: resourceRow.file?.id
      ? {
          id: resourceRow.file.id,
          originalName: resourceRow.file.originalName,
          displayName: resourceRow.file.displayName,
          mimeType: resourceRow.file.mimeType,
          sizeBytes: resourceRow.file.sizeBytes,
          authorName: resourceRow.file.authorName,
          license: resourceRow.file.license,
          uploadedAt: resourceRow.file.uploadedAt,
          downloadUrl: `/api/v1/resources/${mod.id}/download`,
        }
      : null,
    navigation,
  }
}

export async function getResourceDownloadPayload(userId: string, rawModuleId: number) {
  const { resourceRow } = await loadAuthorizedResource(userId, rawModuleId)
  const file = resourceRow.file
  if (!file || !file.id) {
    throw new NotFoundError('Resource file attachment not found')
  }

  const bytes = await readFileObjectBytes(file)
  if (!bytes) {
    throw new NotFoundError('Resource file content missing from storage')
  }

  return {
    file,
    buffer: bytes.buffer,
    isSeededStub: bytes.isSeededStub,
  }
}
