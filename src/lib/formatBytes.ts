export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

export function isSafeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const parsed = new URL(raw)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href
    }
    return null
  } catch {
    return null
  }
}
