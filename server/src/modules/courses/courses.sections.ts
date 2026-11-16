import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  courseModules,
  courseSections,
  fileObjects,
  moduleCompletions,
  resources,
} from '../../db/schema.js'
import { requireEnrolledCourse } from './courses.access.js'

export async function listCourseSectionsPayload(userId: string, courseId: number) {
  const [sectionRows, moduleRows, completionRows] = await Promise.all([
    db
      .select()
      .from(courseSections)
      .where(and(eq(courseSections.courseId, courseId), eq(courseSections.visible, true)))
      .orderBy(asc(courseSections.position), asc(courseSections.id)),
    db
      .select()
      .from(courseModules)
      .where(and(eq(courseModules.courseId, courseId), eq(courseModules.visible, true)))
      .orderBy(asc(courseModules.position), asc(courseModules.id)),
    db
      .select({
        moduleId: moduleCompletions.moduleId,
        completedAt: moduleCompletions.completedAt,
      })
      .from(moduleCompletions)
      .innerJoin(courseModules, eq(moduleCompletions.moduleId, courseModules.id))
      .where(and(eq(moduleCompletions.userId, userId), eq(courseModules.courseId, courseId))),
  ])

  const resourceModuleIds = moduleRows
    .filter((m) => m.moduleType === 'resource')
    .map((m) => m.id)

  const resourceRows =
    resourceModuleIds.length > 0
      ? await db
          .select({
            moduleId: resources.moduleId,
            resourceKind: resources.resourceKind,
            displayMode: resources.displayMode,
            fileId: fileObjects.id,
            displayName: fileObjects.displayName,
            originalName: fileObjects.originalName,
            mimeType: fileObjects.mimeType,
            sizeBytes: fileObjects.sizeBytes,
            uploadedAt: fileObjects.uploadedAt,
          })
          .from(resources)
          .leftJoin(fileObjects, eq(resources.fileObjectId, fileObjects.id))
          .where(inArray(resources.moduleId, resourceModuleIds))
      : []

  const completionMap = new Map(completionRows.map((c) => [c.moduleId, c.completedAt]))
  const resourceMap = new Map(resourceRows.map((r) => [r.moduleId, r]))

  const modulesBySection = new Map<number, Array<Record<string, unknown>>>()
  for (const mod of moduleRows) {
    const completedAt = completionMap.get(mod.id) ?? null
    const resMeta = resourceMap.get(mod.id)
    const entry = {
      id: mod.id,
      moodleModuleId: mod.moodleModuleId,
      moduleType: mod.moduleType,
      title: mod.title,
      subsectionLabel: mod.subsectionLabel,
      descriptionHtml: mod.descriptionHtml,
      externalUrl: mod.externalUrl,
      position: mod.position,
      completionTrackable: mod.completionTrackable,
      isCompleted: completedAt !== null,
      completedAt,
      opensAt: mod.opensAt,
      dueOrClosedAt: mod.dueOrClosedAt,
      resource: resMeta
        ? {
            resourceKind: resMeta.resourceKind,
            displayMode: resMeta.displayMode,
            file: resMeta.fileId
              ? {
                  id: resMeta.fileId,
                  displayName: resMeta.displayName,
                  originalName: resMeta.originalName,
                  mimeType: resMeta.mimeType,
                  sizeBytes: resMeta.sizeBytes,
                  uploadedAt: resMeta.uploadedAt,
                }
              : null,
          }
        : null,
    }
    const list = modulesBySection.get(mod.sectionId) ?? []
    list.push(entry)
    modulesBySection.set(mod.sectionId, list)
  }

  return sectionRows.map((sec) => ({
    id: sec.id,
    title: sec.title,
    summaryText: sec.summaryText,
    position: sec.position,
    isCollapsedDefault: sec.isCollapsedDefault,
    weekStart: sec.weekStart,
    weekEnd: sec.weekEnd,
    modules: modulesBySection.get(sec.id) ?? [],
  }))
}

export async function getCourseSections(userId: string, rawCourseId: number) {
  const { course } = await requireEnrolledCourse(userId, rawCourseId)
  const sections = await listCourseSectionsPayload(userId, course.id)
  return {
    course: {
      id: course.id,
      moodleCourseId: course.moodleCourseId,
      code: course.code,
      title: course.title,
    },
    sections,
  }
}
