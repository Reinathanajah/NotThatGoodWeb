import './search.css'
import { Search } from 'lucide-react'
import { useSearchPalette } from '../../context/searchPaletteContext.ts'

export function HeroSearchCapsule() {
  const { openSearch } = useSearchPalette()

  return (
    <button
      type="button"
      className="hero-search-capsule motion-surface"
      onClick={() => openSearch()}
      aria-label="Open global SilverFour search"
    >
      <span className="sf-row" style={{ gap: 'var(--space-2)' }}>
        <Search size={18} color="var(--accent)" aria-hidden="true" />
        <span>Search courses, faculties, assignments...</span>
      </span>
      <kbd className="cmd-kbd">Ctrl K</kbd>
    </button>
  )
}
