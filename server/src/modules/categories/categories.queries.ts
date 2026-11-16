import { and, asc, count, eq, ilike, inArray, like, or, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { academicTerms, categories, courses } from '../../db/schema.js'
import { escapeLikePattern } from '../../utils/sql.js'
import { getUserEnrolledCourseIds, mapCategoryCourseRow } from './categories.enrollment.js'
import {
  getCategoryBreadcrumbs,
  getCourseCountsByCategory,
  resolveCategoryByIdOrMoodleId,
} from './categories.tree.js'

export async function getCategoryDetail(rawId: number) {
  const category = await resolveCategoryByIdOrMoodleId(rawId)

  const [ancestors, children, courseCounts, childCounts] = await Promise.all([
    getCategoryBreadcrumbs(category.id),
    db
      .select()
      .from(categories)
      .where(eq(categories.parentId, category.id))
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    getCourseCountsByCategory(),
    db
      .select({ parentId: categories.parentId, total: count() })
      .from(categories)
      .groupBy(categories.parentId),
  ])

  const childCountMap = new Map<number, number>()
  for (const row of childCounts) {
    if (row.parentId !== null) {
      childCountMap.set(row.parentId, Number(row.total))
    }
  }

  return {
    category: {
      ...category,
      directCourseCount: courseCounts.get(category.id) ?? 0,
    },
    ancestors,
    children: children.map((child) => ({
      ...child,
      directCourseCount: courseCounts.get(child.id) ?? 0,
      childCount: childCountMap.get(child.id) ?? 0,
    })),
  }
}

export async function listCategoryCourses(
  rawId: number,
  options: {
    includeSubcategories: boolean
    search?: string
    page: number
    limit: number
    userId?: string
  },
) {
  const category = await resolveCategoryByIdOrMoodleId(rawId)

  let targetCategoryIds: number[] = [category.id]
  if (options.includeSubcategories) {
    const escapedPath = escapeLikePattern(category.path)
    const descendantRows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.id, category.id), like(categories.path, `${escapedPath}/%`)))
    targetCategoryIds = descendantRows.map((row) => row.id)
  }

  const conditions = [
    eq(courses.visible, true),
    inArray(courses.categoryId, targetCategoryIds),
  ]

  if (options.search) {
    const pattern = `%${escapeLikePattern(options.search)}%`
    conditions.push(
      or(
        ilike(courses.title, pattern),
        ilike(courses.shortName, pattern),
        ilike(courses.code, pattern),
      )!,
    )
  }

  const whereClause = and(...conditions)
  const offset = (options.page - 1) * options.limit

  const [countResult, rows] = await Promise.all([
    db.select({ total: count() }).from(courses).where(whereClause),
    db
      .select({
        id: courses.id,
        moodleCourseId: courses.moodleCourseId,
        code: courses.code,
        title: courses.title,
        shortName: courses.shortName,
        format: courses.format,
        coverStyle: courses.coverStyle,
        startAt: courses.startAt,
        endAt: courses.endAt,
        categoryId: courses.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        termId: academicTerms.id,
        termCode: academicTerms.code,
        termLabel: academicTerms.label,
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(academicTerms, eq(courses.termId, academicTerms.id))
      .where(whereClause)
      .orderBy(asc(courses.title), sql`${courses.id} ASC`)
      .limit(options.limit)
      .offset(offset),
  ])

  const enrolledSet = await getUserEnrolledCourseIds(
    options.userId,
    rows.map((row) => row.id),
  )

  const total = Number(countResult[0]?.total ?? 0)
  return {
    category: {
      id: category.id,
      moodleCategoryId: category.moodleCategoryId,
      name: category.name,
      slug: category.slug,
    },
    items: rows.map((row) => mapCategoryCourseRow(row, enrolledSet)),
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / options.limit)),
    },
  }
}
