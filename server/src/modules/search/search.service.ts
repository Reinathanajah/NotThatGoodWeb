import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { enrollments } from '../../db/schema.js'
import { escapeLikePattern } from '../../utils/sql.js'
import {
  searchCategories,
  searchCourses,
  searchModules,
  searchStaticPages,
} from './search.queries.js'

export type SearchScope = 'all' | 'courses' | 'categories' | 'modules' | 'pages'

export async function runGlobalSearch(options: {
  q: string
  scope: SearchScope
  limit: number
  userId?: string
}) {
  const pattern = `%${escapeLikePattern(options.q)}%`
  const want = (target: Exclude<SearchScope, 'all'>) =>
    options.scope === 'all' || options.scope === target

  const enrolledCourseIds = options.userId
    ? new Set(
        (
          await db
            .select({ courseId: enrollments.courseId })
            .from(enrollments)
            .where(eq(enrollments.userId, options.userId))
        ).map((r) => r.courseId),
      )
    : new Set<number>()

  const [courseRows, categoryRows, moduleRows, pageRows] = await Promise.all([
    want('courses') ? searchCourses(pattern, options.limit) : Promise.resolve([]),
    want('categories') ? searchCategories(pattern, options.limit) : Promise.resolve([]),
    want('modules') ? searchModules(pattern, options.limit) : Promise.resolve([]),
    want('pages')
      ? searchStaticPages(pattern, options.limit, Boolean(options.userId))
      : Promise.resolve([]),
  ])

  const coursesResult = courseRows.map((c) => ({
    ...c,
    isEnrolled: enrolledCourseIds.has(c.id),
  }))

  const modulesResult = moduleRows.map((m) => ({
    ...m,
    isEnrolled: enrolledCourseIds.has(m.courseId),
  }))

  return {
    query: options.q,
    scope: options.scope,
    counts: {
      courses: coursesResult.length,
      categories: categoryRows.length,
      modules: modulesResult.length,
      pages: pageRows.length,
      total:
        coursesResult.length +
        categoryRows.length +
        modulesResult.length +
        pageRows.length,
    },
    results: {
      courses: coursesResult,
      categories: categoryRows,
      modules: modulesResult,
      pages: pageRows,
    },
  }
}
