import { ExternalLink } from 'lucide-react'
import { Link } from 'wouter'
import { useI18n } from '../../context/i18nContextValue.ts'
import type { NavigationItemDto, NavigationMenusDto } from '../../types/navigation.ts'

interface ResourcesMenuProps {
  menus: NavigationMenusDto | null
  onNavigate: () => void
}

function NavGroupSection({
  heading,
  items,
  onNavigate,
}: {
  heading: string
  items: NavigationItemDto[]
  onNavigate: () => void
}) {
  if (items.length === 0) return null
  return (
    <div className="sf-stack" style={{ gap: 'var(--space-1)' }}>
      <p className="sf-text-muted" style={{ fontWeight: 700, paddingInline: 'var(--space-3)' }}>
        {heading}
      </p>
      {items.map((item) =>
        item.isExternal ? (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className="sf-popover-item"
            role="menuitem"
            onClick={onNavigate}
          >
            <span className="sf-row" style={{ justifyContent: 'space-between' }}>
              <span>{item.label}</span>
              <ExternalLink size={15} aria-hidden="true" />
            </span>
          </a>
        ) : (
          <Link
            key={item.id}
            href={item.href}
            className="sf-popover-item"
            role="menuitem"
            onClick={onNavigate}
          >
            <span>{item.label}</span>
          </Link>
        ),
      )}
    </div>
  )
}

export function ResourcesMenu({ menus, onNavigate }: ResourcesMenuProps) {
  const { strings } = useI18n()

  return (
    <div
      className="sf-popover-panel sf-stack"
      style={{ minWidth: '280px', gap: 'var(--space-3)' }}
      role="menu"
      aria-label="Academic portals and guides"
    >
      <NavGroupSection
        heading={strings.nav.portalLinks}
        items={menus?.portalLinks ?? []}
        onNavigate={onNavigate}
      />
      <NavGroupSection
        heading={strings.nav.guideLinks}
        items={menus?.guideLinks ?? []}
        onNavigate={onNavigate}
      />
      <NavGroupSection
        heading={strings.nav.external}
        items={menus?.external ?? []}
        onNavigate={onNavigate}
      />
    </div>
  )
}
