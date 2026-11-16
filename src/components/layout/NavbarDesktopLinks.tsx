import { ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import type { CategoryNodeDto, NavigationMenusDto } from '../../types/navigation.ts'
import { FacultyMegamenu } from './FacultyMegamenu.tsx'
import { FALLBACK_PRIMARY_LINKS } from './navLinks.ts'
import { ResourcesMenu } from './ResourcesMenu.tsx'

export type NavPopover = 'faculty' | 'resources' | 'user' | null

interface NavbarDesktopLinksProps {
  menus: NavigationMenusDto | null
  facultyTree: CategoryNodeDto[]
  openMenu: NavPopover
  onToggleMenu: (target: 'faculty' | 'resources') => void
  onCloseMenu: () => void
}

export function NavbarDesktopLinks({
  menus,
  facultyTree,
  openMenu,
  onToggleMenu,
  onCloseMenu,
}: NavbarDesktopLinksProps) {
  const [location] = useLocation()
  const { strings } = useI18n()
  const primaryLinks = menus?.primary ?? FALLBACK_PRIMARY_LINKS

  const translatePrimary = (href: string, fallback: string) => {
    if (href === '/') return strings.nav.home
    if (href === '/my') return strings.nav.dashboard
    if (href === '/my/courses') return strings.nav.myCourses
    return fallback
  }

  const isRouteActive = (href: string) => {
    if (href === '/') return location === '/'
    if (href === '/my') return location === '/my' || location === '/my/'
    if (href === '/my/courses') return location.startsWith('/my/courses')
    return location.startsWith(href)
  }

  return (
    <nav className="sf-nav-desktop" aria-label="Main navigation">
      {primaryLinks.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="sf-nav-link motion-surface"
          aria-current={isRouteActive(item.href) ? 'page' : undefined}
          onClick={onCloseMenu}
        >
          {translatePrimary(item.href, item.label)}
        </Link>
      ))}

      <div className="sf-popover-anchor">
        <button
          type="button"
          className="sf-nav-link motion-surface"
          aria-current={location.startsWith('/categories') ? 'page' : undefined}
          aria-expanded={openMenu === 'faculty'}
          aria-haspopup="menu"
          onClick={() => onToggleMenu('faculty')}
        >
          <span>{strings.nav.facultyHomepage}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {openMenu === 'faculty' ? (
          <FacultyMegamenu
            facultyTree={facultyTree}
            fallbackLinks={menus?.facultyHomepage ?? []}
            onNavigate={onCloseMenu}
          />
        ) : null}
      </div>

      <div className="sf-popover-anchor">
        <button
          type="button"
          className="sf-nav-link motion-surface"
          aria-current={
            location.startsWith('/static') || location.startsWith('/reports') ? 'page' : undefined
          }
          aria-expanded={openMenu === 'resources'}
          aria-haspopup="menu"
          onClick={() => onToggleMenu('resources')}
        >
          <span>Resources</span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {openMenu === 'resources' ? (
          <ResourcesMenu menus={menus} onNavigate={onCloseMenu} />
        ) : null}
      </div>
    </nav>
  )
}
