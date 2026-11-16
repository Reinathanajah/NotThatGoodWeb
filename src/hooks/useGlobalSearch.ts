import { useCallback, useEffect, useState } from 'react'
import { runGlobalSearch } from '../services/searchApi.ts'
import type { SearchResultsDto, SearchScope } from '../types/navigation.ts'

export function useGlobalSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [scope, setScope] = useState<SearchScope>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResultsDto | null>(null)
  const [nonce, setNonce] = useState(0)

  const trimmed = query.trim()

  useEffect(() => {
    if (!trimmed) return

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)
      runGlobalSearch(trimmed, scope, 10, controller.signal).then(
        (payload) => {
          setResults(payload)
          setLoading(false)
        },
        (err: unknown) => {
          if (controller.signal.aborted) return
          setError(err instanceof Error ? err.message : 'Search request failed')
          setLoading(false)
        },
      )
    }, 220)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, scope, nonce])

  const retry = useCallback(() => {
    setNonce((prev) => prev + 1)
  }, [])

  return {
    query,
    setQuery,
    scope,
    setScope,
    loading: Boolean(trimmed) && loading,
    error: trimmed ? error : null,
    results: trimmed ? results : null,
    retry,
  }
}
