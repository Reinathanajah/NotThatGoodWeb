import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { privateFiles } from '../../db/schema.js'
import { ConflictError, NotFoundError } from '../../utils/errors.js'

type QueryRunner = Pick<typeof db, 'select'>

export async function resolveOwnedPrivateFolder(
  userId: string,
  folderId: string,
  runner: QueryRunner = db,
) {
  const [folder] = await runner
    .select()
    .from(privateFiles)
    .where(
      and(
        eq(privateFiles.id, folderId),
        eq(privateFiles.userId, userId),
        eq(privateFiles.isFolder, true),
      ),
    )
    .limit(1)

  if (!folder) {
    throw new NotFoundError('Private folder not found')
  }

  return folder
}

export async function buildPrivateFolderBreadcrumbs(userId: string, folderId?: string) {
  if (!folderId) return []
  const crumbs: Array<{ id: string; name: string }> = []
  let cursor: string | null = folderId

  for (let depth = 0; depth < 20 && cursor; depth++) {
    const folder = await resolveOwnedPrivateFolder(userId, cursor)
    crumbs.unshift({ id: folder.id, name: folder.name })
    cursor = folder.parentFolderId
  }

  return crumbs
}

export async function assertUniquePrivateEntryName(
  userId: string,
  parentFolderId: string | null,
  name: string,
  runner: QueryRunner = db,
) {
  const [duplicate] = await runner
    .select({ id: privateFiles.id })
    .from(privateFiles)
    .where(
      and(
        eq(privateFiles.userId, userId),
        parentFolderId
          ? eq(privateFiles.parentFolderId, parentFolderId)
          : isNull(privateFiles.parentFolderId),
        eq(privateFiles.name, name),
      ),
    )
    .limit(1)

  if (duplicate) {
    throw new ConflictError(`An entry named "${name}" already exists in this folder`)
  }
}

export async function createPrivateFolder(
  userId: string,
  input: { name: string; parentFolderId?: string | null },
) {
  const parentId = input.parentFolderId ?? null
  if (parentId) {
    await resolveOwnedPrivateFolder(userId, parentId)
  }

  await assertUniquePrivateEntryName(userId, parentId, input.name)

  const [created] = await db
    .insert(privateFiles)
    .values({
      userId,
      parentFolderId: parentId,
      isFolder: true,
      name: input.name,
    })
    .returning()

  return created
}
