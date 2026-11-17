import { useEffect, useState } from 'react'
import { fetchFilePickerSources } from '../services/filesApi.ts'
import type { FilePickerSourcesDto } from '../types/files.ts'

export function useFilePickerSources(open: boolean, searchQuery: string) {
  const [data, setData] = useState<FilePickerSourcesDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      fetchFilePickerSources('all', searchQuery, controller.signal).then(
        (res) => {
          if (controller.signal.aborted) return
          setData(res)
          setError(null)
          setLoading(false)
        },
        (err: unknown) => {
          if (controller.signal.aborted) return
          setError(err instanceof Error ? err.message : 'Unable to load file sources')
          setLoading(false)
        },
      )
    }, 180)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [open, searchQuery, nonce])

  return {
    data,
    loading,
    error,
    refresh: () => setNonce((n) => n + 1),
  }
}
