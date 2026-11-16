import { asc, count, eq, inArray, or } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { categories, courses } from '../../db/schema.js'
import { NotFoundError } from '../../utils/errors.js'

export interface CategoryNode {
  id: number
  moodleCategoryId: number | null
  parentId: number | null
  name: string
  slug: string
  path: string
  depth: number
  sortOrder: number
  description: string | null
  directCourseCount: number
  children: CategoryNode[]
}

export async function getCourseCountsByCategory(): Promise<Map<number, number>> {
  const rows = await db
    .select({ categoryId: courses.categoryId, total: count() })
    .from(courses)
    .where(eq(courses.visible, true))
    .groupBy(courses.categoryId)

  const map = new Map<number, number>()
  for (const row of rows) {
    if (row.categoryId !== null) {
      map.set(row.categoryId, Number(row.total))
    }
  }
  return map
}

export async function resolveCategoryByIdOrMoodleId(rawId: number) {
  const [found] = await db
    .select()
    .from(categories)
    .where(or(eq(categories.id, rawId), eq(categories.moodleCategoryId, rawId)))
    .limit(1)

  if (!found) {
    throw new NotFoundError('Category not found')
  }

  return found
}

export async function getCategoryBreadcrumbs(categoryId: number | null) {
  if (!categoryId) return []

  const [cat] = await db
    .select({ path: categories.path })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1)

  if (!cat) return []

  const ancestorIds = cat.path
    .split('/')
    .filter(Boolean)
    .map(Number)
    .filter(Number.isInteger)

  if (ancestorIds.length === 0) return []

  return db
    .select({
      id: categories.id,
      moodleCategoryId: categories.moodleCategoryId,
      name: categories.name,
      slug: categories.slug,
      depth: categories.depth,
    })
    .from(categories)
    .where(inArray(categories.id, ancestorIds))
    .orderBy(asc(categories.depth))
}

export function buildCategoryTree(
  rows: Array<typeof categories.$inferSelect>,
  courseCounts: Map<number, number>,
): CategoryNode[] {
  const nodeMap = new Map<number, CategoryNode>()
  for (const cat of rows) {
    nodeMap.set(cat.id, {
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
      children: [],
    })
  }

  const roots: CategoryNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parentId !== null && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
