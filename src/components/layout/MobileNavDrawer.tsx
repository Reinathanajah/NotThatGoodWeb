import { X } from 'lucide-react'
import { useRef } from 'react'
import { Link, useLocation } from 'wouter'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { resolveCategoryHref } from '../../lib/appRoutes.ts'
import type { CategoryNodeDto, NavigationMenusDto } from '../../types/navigation.ts'
import { LanguageSelect } from '../ui/LanguageSelect.tsx'
import { ThemeSwitch } from '../ui/ThemeSwitch.tsx'
import { ACCOUNT_WORKSPACE_LINKS, FALLBACK_PRIMARY_LINKS } from './navLinks.ts'

interface MobileNavDrawerProps {
  open: boolean
  menus: NavigationMenusDto | null
  facultyTree: CategoryNodeDto[]
  editMode: boolean
  togglingEdit: boolean
  onToggleEditMode: () => Promise<void>
  onLogout: () => Promise<void>
  onClose: () => void
}

export function MobileNavDrawer({
  open,
  menus,
  facultyTree,
  editMode,
  togglingEdit,
  onToggleEditMode,
  onLogout,
  onClose,
}: MobileNavDrawerProps) {
  const sheetRef = useRef<HTMLElement | null>(null)
  const [location] = useLocation()

  useFocusTrap(open, sheetRef, onClose)

  if (!open) return null

  const rootNode = facultyTree.find((n) => n.depth === 0)
  const faculties = rootNode?.children ?? []
  const primaryLinks = menus?.primary ?? FALLBACK_PRIMARY_LINKS
  const drawerLinks = [
    ...primaryLinks.map((i) => ({ label: i.label, href: i.href })),
    ...ACCOUNT_WORKSPACE_LINKS.filter((l) => l.href !== '/user/profile'),
  ]

  return (
    <div
      id="mobile-nav-sheet"
      className="sf-drawer-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <nav
        ref={sheetRef}
        className="sf-drawer-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation drawer"
      >
        <div className="sf-row" style={{ justifyContent: 'space-between' }}>
          <strong>SilverFour navigation</strong>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="sf-stack" style={{ gap: 'var(--space-1)' }}>
          {drawerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="sf-drawer-link"
              aria-current={location === item.href ? 'page' : undefined}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <details className="sf-disclosure">
          <summary>Faculty homepage ({faculties.length})</summary>
          <div className="sf-stack" style={{ gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
            {faculties.map((cat) => (
              <Link
                key={cat.id}
                href={resolveCategoryHref(cat)}
                className="sf-drawer-link"
                onClick={onClose}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </details>

        <LanguageSelect id="drawer-lang-select" showLabel />

        <ThemeSwitch />

        <button
          type="button"
          role="switch"
          aria-checked={editMode}
          disabled={togglingEdit}
          className="sf-edit-switch"
          onClick={() => void onToggleEditMode()}
        >
          Edit mode: {editMode ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          onClick={() => {
            onClose()
            void onLogout()
          }}
        >
          Log out
        </button>
      </nav>
    </div>
  )
}
