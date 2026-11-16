import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { staticPages } from '../../db/schema.js'
import { NotFoundError, UnauthorizedError } from '../../utils/errors.js'

/** Retrieve a static page by slug, enforcing public vs authenticated visibility. */
export async function getStaticPageBySlug(slug: string, isAuthenticated: boolean) {
  const [page] = await db
    .select()
    .from(staticPages)
    .where(eq(staticPages.slug, slug))
    .limit(1)

  if (!page) {
    throw new NotFoundError('Static page not found')
  }

  if (!page.isPublic && !isAuthenticated) {
    throw new UnauthorizedError('Authentication required to view this static page')
  }

  return {
    slug: page.slug,
    title: page.title,
    contentMarkdown: page.contentMarkdown,
    links: page.linksJson,
    isPublic: page.isPublic,
    updatedAt: page.updatedAt.toISOString(),
  }
}
