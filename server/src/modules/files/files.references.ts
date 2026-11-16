import { eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { assignmentSubmissionFiles, privateFiles, resources } from '../../db/schema.js'

export async function findReferencedFileObjectIds(fileIds: string[]): Promise<Set<string>> {
  if (fileIds.length === 0) return new Set()

  const [subRefs, resRefs] = await Promise.all([
    db
      .select({ fileObjectId: assignmentSubmissionFiles.fileObjectId })
      .from(assignmentSubmissionFiles)
      .where(inArray(assignmentSubmissionFiles.fileObjectId, fileIds)),
    db
      .select({ fileObjectId: resources.fileObjectId })
      .from(resources)
      .where(inArray(resources.fileObjectId, fileIds)),
  ])

  const referenced = new Set<string>()
  for (const r of subRefs) referenced.add(r.fileObjectId)
  for (const r of resRefs) {
    if (r.fileObjectId) referenced.add(r.fileObjectId)
  }
  return referenced
}

export async function collectDescendantFileObjectIds(
  userId: string,
  rootFolderId: string,
): Promise<string[]> {
  const allEntries = await db
    .select({
      id: privateFiles.id,
      parentFolderId: privateFiles.parentFolderId,
      isFolder: privateFiles.isFolder,
      fileObjectId: privateFiles.fileObjectId,
    })
    .from(privateFiles)
    .where(eq(privateFiles.userId, userId))

  const byParent = new Map<string, typeof allEntries>()
  for (const entry of allEntries) {
    if (!entry.parentFolderId) continue
    const list = byParent.get(entry.parentFolderId) ?? []
    list.push(entry)
    byParent.set(entry.parentFolderId, list)
  }

  const collected: string[] = []
  const stack = [rootFolderId]
  while (stack.length > 0) {
    const currentId = stack.pop()!
    for (const child of byParent.get(currentId) ?? []) {
      if (child.isFolder) {
        stack.push(child.id)
      } else if (child.fileObjectId) {
        collected.push(child.fileObjectId)
      }
    }
  }

  return collected
}
