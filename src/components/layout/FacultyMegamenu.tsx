import { Link } from 'wouter'
import { resolveCategoryHref } from '../../lib/appRoutes.ts'
import type { CategoryNodeDto, FacultyNavItemDto } from '../../types/navigation.ts'

interface FacultyMegamenuProps {
  facultyTree: CategoryNodeDto[]
  fallbackLinks: FacultyNavItemDto[]
  onNavigate: () => void
}

export function FacultyMegamenu({
  facultyTree,
  fallbackLinks,
  onNavigate,
}: FacultyMegamenuProps) {
  const rootNode = facultyTree.find((node) => node.depth === 0)
  const faculties = rootNode?.children ?? []

  if (faculties.length === 0) {
    return (
      <div className="sf-popover-panel sf-mega-grid" role="menu" aria-label="Faculties">
        {fallbackLinks.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="sf-popover-item"
            role="menuitem"
            onClick={onNavigate}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="sf-popover-panel sf-mega-grid" role="menu" aria-label="Faculties">
      {rootNode ? (
        <Link
          href={resolveCategoryHref(rootNode)}
          className="sf-popover-item"
          role="menuitem"
          style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-subtle)' }}
          onClick={onNavigate}
        >
          <strong>{rootNode.name}</strong>
          <span className="sf-text-muted">Browse full academic directory</span>
        </Link>
      ) : null}

      {faculties.map((cat) => {
        const subCount = cat.children?.length ?? 0
        return (
          <Link
            key={cat.id}
            href={resolveCategoryHref(cat)}
            className="sf-popover-item"
            role="menuitem"
            onClick={onNavigate}
          >
            <span>{cat.name}</span>
            {subCount > 0 ? <span className="sf-text-muted">{subCount} programs</span> : null}
          </Link>
        )
      })}
    </div>
  )
}
