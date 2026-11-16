import { and, asc, eq, ilike, inArray, or } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  categories,
  courseModules,
  courses,
  staticPages,
} from '../../db/schema.js'

export function searchCourses(pattern: string, limit: number) {
  return db
    .select({
      id: courses.id,
      moodleCourseId: courses.moodleCourseId,
      code: courses.code,
      title: courses.title,
      shortName: courses.shortName,
      categoryId: courses.categoryId,
      categoryName: categories.name,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(
      and(
        eq(courses.visible, true),
        or(
          ilike(courses.title, pattern),
          ilike(courses.shortName, pattern),
          ilike(courses.code, pattern),
        ),
      ),
    )
    .orderBy(asc(courses.title))
    .limit(limit)
}

export function searchCategories(pattern: string, limit: number) {
  return db
    .select({
      id: categories.id,
      moodleCategoryId: categories.moodleCategoryId,
      name: categories.name,
      slug: categories.slug,
      depth: categories.depth,
    })
    .from(categories)
    .where(or(ilike(categories.name, pattern), ilike(categories.slug, pattern)))
    .orderBy(asc(categories.depth), asc(categories.name))
    .limit(limit)
}

export function searchModules(pattern: string, limit: number) {
  return db
    .select({
      id: courseModules.id,
      moodleModuleId: courseModules.moodleModuleId,
      courseId: courseModules.courseId,
      courseTitle: courses.title,
      moduleType: courseModules.moduleType,
      title: courseModules.title,
      subsectionLabel: courseModules.subsectionLabel,
      opensAt: courseModules.opensAt,
      dueOrClosedAt: courseModules.dueOrClosedAt,
    })
    .from(courseModules)
    .innerJoin(courses, eq(courseModules.courseId, courses.id))
    .where(
      and(
        eq(courses.visible, true),
        eq(courseModules.visible, true),
        or(
          ilike(courseModules.title, pattern),
          ilike(courseModules.subsectionLabel, pattern),
        ),
      ),
    )
    .orderBy(asc(courseModules.title))
    .limit(limit)
}

export function searchStaticPages(pattern: string, limit: number, includePrivate: boolean) {
  return db
    .select({
      slug: staticPages.slug,
      title: staticPages.title,
      isPublic: staticPages.isPublic,
    })
    .from(staticPages)
    .where(
      and(
        includePrivate
          ? inArray(staticPages.isPublic, [true, false])
          : eq(staticPages.isPublic, true),
        or(ilike(staticPages.title, pattern), ilike(staticPages.contentMarkdown, pattern)),
      ),
    )
    .orderBy(asc(staticPages.title))
    .limit(limit)
}
