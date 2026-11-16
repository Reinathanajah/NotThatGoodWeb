import { asc, lte } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { categories, navigationItems } from '../../db/schema.js'

export async function getNavigationMenus(userRole: string) {
  const [navRows, facultyRows] = await Promise.all([
    db
      .select()
      .from(navigationItems)
      .orderBy(asc(navigationItems.menuGroup), asc(navigationItems.sortOrder), asc(navigationItems.id)),
    db
      .select({
        id: categories.id,
        moodleCategoryId: categories.moodleCategoryId,
        name: categories.name,
        slug: categories.slug,
        depth: categories.depth,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(lte(categories.depth, 1))
      .orderBy(asc(categories.depth), asc(categories.sortOrder), asc(categories.id)),
  ])

  const groupMap = new Map<
    string,
    Array<{
      id: number
      label: string
      href: string
      categoryId: number | null
      targetRole: string
      isExternal: boolean
      sortOrder: number
    }>
  >()

  for (const item of navRows) {
    const list = groupMap.get(item.menuGroup) ?? []
    list.push({
      id: item.id,
      label: item.label,
      href: item.href,
      categoryId: item.categoryId,
      targetRole: item.targetRole,
      isExternal: item.isExternal,
      sortOrder: item.sortOrder,
    })
    groupMap.set(item.menuGroup, list)
  }

  return {
    primary: groupMap.get('primary') ?? [],
    facultyHomepage: facultyRows.map((cat) => ({
      id: cat.id,
      moodleCategoryId: cat.moodleCategoryId,
      label: cat.name,
      slug: cat.slug,
      depth: cat.depth,
      href: `/categories/${cat.moodleCategoryId ?? cat.id}`,
    })),
    portalLinks: groupMap.get('portal_links') ?? [],
    guideLinks: groupMap.get('guide_links') ?? [],
    external: groupMap.get('external') ?? [],
    announcements: (groupMap.get('announcement') ?? []).map((item) => ({
      ...item,
      isHighlightedForRole:
        item.targetRole === 'all' || item.targetRole === userRole || userRole === 'admin',
    })),
  }
}
