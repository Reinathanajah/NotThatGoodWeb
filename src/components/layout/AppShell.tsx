import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { SearchPaletteContext } from '../../context/searchPaletteContext.ts'
import { CommandSearchModal } from '../search/CommandSearchModal.tsx'
import { SupportDock } from '../support/SupportDock.tsx'
import { Navbar } from './Navbar.tsx'
import { WorkspaceFooter } from './WorkspaceFooter.tsx'

interface AppShellProps {
  children: ReactNode
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function AppShell({ children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')

  const openSearch = useCallback((query = '') => {
    setInitialQuery(query)
    setSearchOpen(true)
  }, [])

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      } else if (e.key === '/' && !isEditableTarget(e.target)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <SearchPaletteContext.Provider value={{ openSearch }}>
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="sf-container sf-stack"
          style={{ flex: 1, paddingBlock: 'var(--space-5)' }}
        >
          {children}
        </main>
        <WorkspaceFooter />
        <SupportDock />
        {searchOpen ? (
          <CommandSearchModal
            open
            initialQuery={initialQuery}
            onClose={() => setSearchOpen(false)}
          />
        ) : null}
      </div>
    </SearchPaletteContext.Provider>
  )
}
