import './categoryTree.css'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'wouter'
import { resolveCategoryHref } from '../../lib/appRoutes.ts'
import type { CategoryNodeDto } from '../../types/navigation.ts'

interface CategoryTreeNavProps {
  tree: CategoryNodeDto[]
  activeCategoryId: number
  ancestorIds: number[]
}

function TreeNodeItem({
  node,
  activeCategoryId,
  expandedIds,
  onToggleExpand,
}: {
  node: CategoryNodeDto
  activeCategoryId: number
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
}) {
  const hasChildren = (node.children?.length ?? 0) > 0
  const isExpanded = expandedIds.has(node.id)
  const isCurrent = node.id === activeCategoryId || node.moodleCategoryId === activeCategoryId

  return (
    <li>
      <div className="cat-tree-row">
        {hasChildren ? (
          <button
            type="button"
            className="cat-tree-toggle"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            onClick={() => onToggleExpand(node.id)}
          >
            {isExpanded ? (
              <ChevronDown size={16} aria-hidden="true" />
            ) : (
              <ChevronRight size={16} aria-hidden="true" />
            )}
          </button>
        ) : (
          <span style={{ width: 'var(--tap-min)', flexShrink: 0 }} aria-hidden="true" />
        )}

        <Link
          href={resolveCategoryHref(node)}
          className="cat-tree-link"
          aria-current={isCurrent ? 'page' : undefined}
        >
          <span>{node.name}</span>
          {node.directCourseCount > 0 ? (
            <span className="sf-text-muted tabular-nums">{node.directCourseCount}</span>
          ) : null}
        </Link>
      </div>

      {hasChildren && isExpanded ? (
        <ul className="cat-tree-list cat-tree-children">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              activeCategoryId={activeCategoryId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CategoryTreeNav({
  tree,
  activeCategoryId,
  ancestorIds,
}: CategoryTreeNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userExpanded, setUserExpanded] = useState<Set<number>>(() => new Set([1]))
  const [userCollapsed, setUserCollapsed] = useState<Set<number>>(() => new Set())

  const expandedIds = new Set<number>()
  for (const id of userExpanded) expandedIds.add(id)
  for (const id of ancestorIds) {
    if (!userCollapsed.has(id)) expandedIds.add(id)
  }

  const toggleNode = (id: number) => {
    const currentlyExpanded = expandedIds.has(id)
    setUserExpanded((prev) => {
      const next = new Set(prev)
      if (currentlyExpanded) next.delete(id)
      else next.add(id)
      return next
    })
    setUserCollapsed((prev) => {
      const next = new Set(prev)
      if (currentlyExpanded) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <aside className="sf-surface cat-tree-card sf-stack" aria-label="Academic category tree">
      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <h2 className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
          Academic directory
        </h2>
        <button
          type="button"
          className="sf-btn sf-btn--secondary cat-tree-mobile-toggle"
          aria-expanded={mobileOpen}
          aria-controls="cat-tree-list-wrap"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? 'Hide tree' : 'Browse tree'}
        </button>
      </div>
      <div
        id="cat-tree-list-wrap"
        className={mobileOpen ? undefined : 'cat-tree-body--collapsed'}
      >
        {tree.length === 0 ? (
          <p className="sf-text-muted">Loading category directory...</p>
        ) : (
          <ul className="cat-tree-list">
            {tree.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                activeCategoryId={activeCategoryId}
                expandedIds={expandedIds}
                onToggleExpand={toggleNode}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
