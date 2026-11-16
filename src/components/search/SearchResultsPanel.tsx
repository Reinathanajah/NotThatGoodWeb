import { useEffect, useRef } from 'react'
import { Link } from 'wouter'
import type { SearchResultsDto, SearchScope } from '../../types/navigation.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { HighlightedText } from './HighlightedText.tsx'
import {
  flattenSearchResults,
  SEARCH_SCOPES,
  SUGGESTED_SEARCH_QUERIES,
  type FlatSearchItem,
} from './searchUtils.ts'

interface SearchResultsPanelProps {
  query: string
  scope: SearchScope
  loading: boolean
  error: string | null
  results: SearchResultsDto | null
  activeIndex: number
  onSelectScope: (scope: SearchScope) => void
  onPickQuery: (query: string) => void
  onRetry: () => void
  onSelectResult: (item: FlatSearchItem) => void
}

export function SearchResultsPanel({
  query,
  scope,
  loading,
  error,
  results,
  activeIndex,
  onSelectScope,
  onPickQuery,
  onRetry,
  onSelectResult,
}: SearchResultsPanelProps) {
  const activeOptionRef = useRef<HTMLAnchorElement | null>(null)
  const items = flattenSearchResults(results)

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const getScopeCount = (id: SearchScope): number | null => {
    if (!results) return null
    if (id === 'all') return results.counts.total
    return results.counts[id]
  }

  return (
    <>
      <div className="cmd-tabs" role="tablist" aria-label="Search result scopes">
        {SEARCH_SCOPES.map((tab) => {
          const count = getScopeCount(tab.id)
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={scope === tab.id}
              className="cmd-tab motion-surface"
              onClick={() => onSelectScope(tab.id)}
            >
              {tab.label}
              {count !== null ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      <div className="cmd-results-scroll">
        {!query.trim() ? (
          <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
            <p className="sf-text-muted">Quick suggestions across courses, faculties, and guides:</p>
            <div className="sf-row">
              {SUGGESTED_SEARCH_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="sf-btn sf-btn--secondary"
                  onClick={() => onPickQuery(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : error ? (
          <StatusBanner
            variant="error"
            title="Search unavailable"
            message={error}
            actionLabel="Retry search"
            onAction={onRetry}
          />
        ) : loading && !results ? (
          <StatusBanner variant="loading" title="Searching SilverFour" skeletonLines={3} />
        ) : items.length === 0 ? (
          <StatusBanner
            variant="empty"
            title={`No matches for "${query.trim()}"`}
            message="Try another keyword or expand your scope filter."
            actionLabel={scope !== 'all' ? 'Search all scopes' : undefined}
            onAction={scope !== 'all' ? () => onSelectScope('all') : undefined}
          />
        ) : (
          <div role="listbox" aria-label="Search results" className="sf-stack" style={{ gap: 'var(--space-2)' }}>
            {items.map((item, idx) => {
              const showGroup = idx === 0 || items[idx - 1].group !== item.group
              const isSelected = idx === activeIndex
              return (
                <div key={item.key} className="sf-stack" style={{ gap: 'var(--space-1)' }}>
                  {showGroup ? (
                    <p className="sf-text-muted" style={{ fontWeight: 700, paddingTop: 'var(--space-1)' }}>
                      {item.groupLabel}
                    </p>
                  ) : null}
                  <Link
                    ref={isSelected ? activeOptionRef : undefined}
                    href={item.href}
                    role="option"
                    aria-selected={isSelected}
                    className="cmd-result-row motion-surface"
                    onClick={() => onSelectResult(item)}
                  >
                    <div className="sf-stack" style={{ gap: '2px' }}>
                      <strong>
                        <HighlightedText text={item.title} query={query} />
                      </strong>
                      <span className="sf-text-muted">
                        <HighlightedText text={item.subtitle} query={query} />
                      </span>
                    </div>
                    <span className="sf-text-muted" style={{ fontWeight: 600 }}>
                      {item.badge}
                    </span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
