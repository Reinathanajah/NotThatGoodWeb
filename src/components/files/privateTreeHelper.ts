import type { PrivateFileEntryDto } from '../../types/files.ts'

export interface TreeNode {
  entry: PrivateFileEntryDto
  depth: number
}

export function flattenPrivateTree(entries: PrivateFileEntryDto[]): TreeNode[] {
  const byParent = new Map<string | null, PrivateFileEntryDto[]>()
  for (const entry of entries) {
    const key = entry.parentFolderId ?? null
    const list = byParent.get(key) ?? []
    list.push(entry)
    byParent.set(key, list)
  }

  const out: TreeNode[] = []
  const visited = new Set<string>()

  function visit(parentId: string | null, depth: number) {
    for (const child of byParent.get(parentId) ?? []) {
      if (visited.has(child.id)) continue
      visited.add(child.id)
      out.push({ entry: child, depth })
      if (child.isFolder) {
        visit(child.id, depth + 1)
      }
    }
  }

  visit(null, 0)
  return out
}
