import { Search } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { useLocation, useSearch } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import { SearchResultsPanel } from '../components/search/SearchResultsPanel.tsx'
import { flattenSearchResults } from '../components/search/searchUtils.ts'
import '../components/search/search.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useGlobalSearch } from '../hooks/useGlobalSearch.ts'

export function SearchPage() {
  useDocumentTitle('Search')
  const searchParams = useSearch()
  const initialQ = new URLSearchParams(searchParams).get('q') ?? ''
  const [, setLocation] = useLocation()
  const { query, setQuery, scope, setScope, loading, error, results, retry } =
    useGlobalSearch(initialQ)
  const [activeIndex, setActiveIndex] = useState(0)

  const flatItems = flattenSearchResults(results)
  const clampedIndex = flatItems.length > 0 ? Math.min(activeIndex, flatItems.length - 1) : -1

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flatItems.length > 0) {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp' && flatItems.length > 0) {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1))
    } else if (e.key === 'Enter' && clampedIndex >= 0 && flatItems[clampedIndex]) {
      e.preventDefault()
      setLocation(flatItems[clampedIndex].href)
    }
  }

  return (
    <AppShell>
      <section className="sf-surface sf-stack" aria-labelledby="search-page-title">
        <div style={{ padding: 'var(--space-4) var(--space-4) 0' }}>
          <h1 id="search-page-title" className="sf-heading-display">
            Search SilverFour
          </h1>
        </div>

        <div className="cmd-input-bar">
          <Search size={20} color="var(--accent)" aria-hidden="true" />
          <label htmlFor="page-search-input" className="sr-only">
            Search query
          </label>
          <input
            id="page-search-input"
            type="search"
            className="cmd-input"
            placeholder="Search courses, faculties, assignments, or guides..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <SearchResultsPanel
          query={query}
          scope={scope}
          loading={loading}
          error={error}
          results={results}
          activeIndex={clampedIndex}
          onSelectScope={(next) => {
            setScope(next)
            setActiveIndex(0)
          }}
          onPickQuery={(picked) => {
            setQuery(picked)
            setActiveIndex(0)
          }}
          onRetry={retry}
          onSelectResult={() => {}}
        />
      </section>
    </AppShell>
  )
}
