import { asc } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { categories } from '../../db/schema.js'
import {
  buildCategoryTree,
  getCourseCountsByCategory,
} from './categories.tree.js'

export { getCategoryDetail, listCategoryCourses } from './categories.queries.js'
export {
  getCategoryBreadcrumbs,
  resolveCategoryByIdOrMoodleId,
  type CategoryNode,
} from './categories.tree.js'

export async function listCategories(options: {
  view: 'tree' | 'flat'
  depth?: number
  parentId?: number
}) {
  const [allCategories, courseCounts] = await Promise.all([
    db
      .select()
      .from(categories)
      .orderBy(asc(categories.depth), asc(categories.sortOrder), asc(categories.id)),
    getCourseCountsByCategory(),
  ])

  const filtered = allCategories.filter((cat) => {
    if (options.depth !== undefined && cat.depth > options.depth) return false
    if (options.parentId !== undefined && cat.parentId !== options.parentId) return false
    return true
  })

  if (options.view === 'flat' || options.parentId !== undefined) {
    return filtered.map((cat) => ({
      id: cat.id,
      moodleCategoryId: cat.moodleCategoryId,
      parentId: cat.parentId,
      name: cat.name,
      slug: cat.slug,
      path: cat.path,
      depth: cat.depth,
      sortOrder: cat.sortOrder,
      description: cat.description,
      directCourseCount: courseCounts.get(cat.id) ?? 0,
    }))
  }

  return buildCategoryTree(filtered, courseCounts)
}
