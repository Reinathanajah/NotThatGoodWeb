import './navbar.css'
import './popover.css'
import './drawer.css'
import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { useNavigationData } from '../../hooks/useNavigationData.ts'
import { MobileNavDrawer } from './MobileNavDrawer.tsx'
import { NavbarDesktopLinks, type NavPopover } from './NavbarDesktopLinks.tsx'
import { NavbarUtilities } from './NavbarUtilities.tsx'

export function Navbar() {
  const { user, logout } = useAuth()
  const { menus, facultyTree, unreadCount, editMode, togglingEdit, toggleEditMode } =
    useNavigationData()
  const [openMenu, setOpenMenu] = useState<NavPopover>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!openMenu) return
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    window.addEventListener('mousedown', handleOutside)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('keydown', handleKey)
    }
  }, [openMenu])

  const toggleMenu = (target: Exclude<NavPopover, null>) => {
    setOpenMenu((prev) => (prev === target ? null : target))
  }

  return (
    <header ref={navRef} className="sf-nav-header">
      <div className="sf-container sf-nav-inner">
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <button
            ref={mobileTriggerRef}
            type="button"
            className="sf-nav-icon-btn sf-nav-mobile-trigger"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-sheet"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={18} aria-hidden="true" />
            <span className="sf-nav-mobile-label">Menu</span>
          </button>

          <Link href="/" className="sf-nav-brand" aria-label="SilverFour learning workspace home">
            <img src="/favicon.svg" alt="" width={24} height={24} aria-hidden="true" />
            <span>SilverFour</span>
          </Link>
        </div>

        <NavbarDesktopLinks
          menus={menus}
          facultyTree={facultyTree}
          openMenu={openMenu}
          onToggleMenu={toggleMenu}
          onCloseMenu={() => setOpenMenu(null)}
        />

        <NavbarUtilities
          fullName={user?.fullName ?? 'Student'}
          username={user?.username ?? ''}
          unreadCount={unreadCount}
          editMode={editMode}
          togglingEdit={togglingEdit}
          userMenuOpen={openMenu === 'user'}
          onToggleUserMenu={() => toggleMenu('user')}
          onCloseMenu={() => setOpenMenu(null)}
          onToggleEditMode={toggleEditMode}
          onLogout={logout}
        />
      </div>

      <MobileNavDrawer
        open={drawerOpen}
        menus={menus}
        facultyTree={facultyTree}
        editMode={editMode}
        togglingEdit={togglingEdit}
        onToggleEditMode={toggleEditMode}
        onLogout={logout}
        onClose={() => {
          setDrawerOpen(false)
          mobileTriggerRef.current?.focus()
        }}
      />
    </header>
  )
}
