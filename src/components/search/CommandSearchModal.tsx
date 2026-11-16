import '../ui/modal.css'
import './search.css'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation } from 'wouter'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { useGlobalSearch } from '../../hooks/useGlobalSearch.ts'
import { SearchResultsPanel } from './SearchResultsPanel.tsx'
import { flattenSearchResults } from './searchUtils.ts'

interface CommandSearchModalProps {
  open: boolean
  initialQuery?: string
  onClose: () => void
}

export function CommandSearchModal({
  open,
  initialQuery = '',
  onClose,
}: CommandSearchModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [, setLocation] = useLocation()
  const { query, setQuery, scope, setScope, loading, error, results, retry } =
    useGlobalSearch(initialQuery)
  const [activeIndex, setActiveIndex] = useState(0)

  useFocusTrap(open, dialogRef, onClose)

  useEffect(() => {
    if (!open) return
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(raf)
  }, [open])

  if (!open) return null

  const flatItems = flattenSearchResults(results)
  const clampedIndex = flatItems.length > 0 ? Math.min(activeIndex, flatItems.length - 1) : -1

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flatItems.length > 0) {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp' && flatItems.length > 0) {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1))
    } else if (e.key === 'Enter' && clampedIndex >= 0 && flatItems[clampedIndex]) {
      e.preventDefault()
      setLocation(flatItems[clampedIndex].href)
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="cmd-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Global SilverFour search"
      >
        <div className="cmd-input-bar">
          <Search size={20} color="var(--accent)" aria-hidden="true" />
          <label htmlFor="cmd-search-input" className="sr-only">
            Search courses, faculties, activities, or guides
          </label>
          <input
            ref={inputRef}
            id="cmd-search-input"
            type="search"
            className="cmd-input"
            placeholder="Search courses, faculties, assignments, or guides..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={20} aria-hidden="true" />
          </button>
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
            inputRef.current?.focus()
          }}
          onRetry={retry}
          onSelectResult={() => onClose()}
        />
      </div>
    </div>
  )
}
