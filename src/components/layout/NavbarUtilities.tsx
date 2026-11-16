import { Bell, ChevronDown, MessageCircle, Search } from 'lucide-react'
import { Link } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import { useSearchPalette } from '../../context/searchPaletteContext.ts'
import { ThemeSwitch } from '../ui/ThemeSwitch.tsx'
import { UserAccountMenu } from './UserAccountMenu.tsx'

interface NavbarUtilitiesProps {
  fullName: string
  username: string
  unreadCount: number
  editMode: boolean
  togglingEdit: boolean
  userMenuOpen: boolean
  onToggleUserMenu: () => void
  onCloseMenu: () => void
  onToggleEditMode: () => Promise<void>
  onLogout: () => Promise<void>
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function NavbarUtilities({
  fullName,
  username,
  unreadCount,
  editMode,
  togglingEdit,
  userMenuOpen,
  onToggleUserMenu,
  onCloseMenu,
  onToggleEditMode,
  onLogout,
}: NavbarUtilitiesProps) {
  const { openSearch } = useSearchPalette()
  const { strings } = useI18n()

  return (
    <div className="sf-nav-utilities">
      <button
        type="button"
        className="sf-nav-icon-btn"
        aria-label={strings.common.search}
        aria-keyshortcuts="Control+k /"
        onClick={() => openSearch()}
      >
        <Search size={18} aria-hidden="true" />
      </button>

      <Link
        href="/notifications"
        className="sf-nav-icon-btn"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 ? <span className="sf-nav-badge tabular-nums">{unreadCount}</span> : null}
      </Link>

      <Link
        href="/messages"
        className="sf-nav-icon-btn sf-nav-sm-only"
        aria-label="Messages"
      >
        <MessageCircle size={18} aria-hidden="true" />
      </Link>

      <button
        type="button"
        role="switch"
        aria-checked={editMode}
        disabled={togglingEdit}
        className="sf-edit-switch sf-nav-desktop"
        onClick={() => void onToggleEditMode()}
      >
        {strings.nav.editMode}
      </button>

      <span className="sf-nav-sm-only">
        <ThemeSwitch compact />
      </span>

      <div className="sf-popover-anchor">
        <button
          type="button"
          className="sf-nav-icon-btn"
          aria-expanded={userMenuOpen}
          aria-haspopup="menu"
          aria-label={`Account menu for ${fullName}`}
          onClick={onToggleUserMenu}
        >
          <span className="sf-avatar-chip" aria-hidden="true">
            {getInitials(fullName)}
          </span>
          <span className="sf-user-name" style={{ marginLeft: '8px' }}>
            {fullName}
          </span>
          <span className="sf-nav-sm-only" style={{ marginLeft: '4px' }}>
            <ChevronDown size={16} aria-hidden="true" />
          </span>
        </button>

        {userMenuOpen ? (
          <UserAccountMenu
            fullName={fullName}
            username={username}
            onNavigate={onCloseMenu}
            onLogout={onLogout}
          />
        ) : null}
      </div>
    </div>
  )
}
