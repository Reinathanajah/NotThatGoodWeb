import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'wouter'
import { resolveCategoryHref } from '../../lib/appRoutes.ts'
import type { CategoryDetailDto, CategoryNodeDto } from '../../types/navigation.ts'

interface CategoryBreadcrumbHeaderProps {
  detail: CategoryDetailDto | null
  tree: CategoryNodeDto[]
  activeCategoryId: number
  onJumpCategory: (targetId: number) => void
}

interface FlatCategoryOption {
  valueId: number
  label: string
}

function flattenOptions(nodes: CategoryNodeDto[], depth = 0): FlatCategoryOption[] {
  const list: FlatCategoryOption[] = []
  const indent = '\u00A0\u00A0'.repeat(depth)
  for (const node of nodes) {
    list.push({
      valueId: node.moodleCategoryId ?? node.id,
      label: `${indent}${node.name}`,
    })
    if (node.children?.length) {
      list.push(...flattenOptions(node.children, depth + 1))
    }
  }
  return list
}

export function CategoryBreadcrumbHeader({
  detail,
  tree,
  activeCategoryId,
  onJumpCategory,
}: CategoryBreadcrumbHeaderProps) {
  const current = detail?.category
  const ancestors = detail?.ancestors ?? []
  const options = flattenOptions(tree)
  const selectedVal = current ? (current.moodleCategoryId ?? current.id) : activeCategoryId

  return (
    <header className="sf-surface cat-header-card sf-stack" aria-labelledby="cat-page-heading">
      {ancestors.length > 0 ? (
        <nav aria-label="Category breadcrumb">
          <ol className="cat-breadcrumb-list">
            {ancestors.map((item, idx) => {
              const isLast = idx === ancestors.length - 1
              return (
                <Fragment key={item.id}>
                  <li className="cat-breadcrumb-item">
                    {isLast ? (
                      <span aria-current="page" style={{ fontWeight: 600 }}>
                        {item.name}
                      </span>
                    ) : (
                      <Link href={resolveCategoryHref(item)}>{item.name}</Link>
                    )}
                    {!isLast ? <ChevronRight size={16} aria-hidden="true" /> : null}
                  </li>
                </Fragment>
              )
            })}
          </ol>
        </nav>
      ) : null}

      <div className="dash-controls">
        <div className="sf-stack" style={{ gap: 'var(--space-1)' }}>
          <h1 id="cat-page-heading" className="sf-heading-display">
            {current?.name ?? 'Academic directory'}
          </h1>
          <p className="sf-text-muted">
            {current?.description ??
              'Browse academic faculties, programs, and published course syllabi.'}
          </p>
        </div>

        {options.length > 0 ? (
          <div className="sf-stack" style={{ gap: '4px' }}>
            <label htmlFor="cat-quick-jump" className="sf-text-muted" style={{ fontWeight: 600 }}>
              Jump to category
            </label>
            <select
              id="cat-quick-jump"
              className="dash-select"
              value={selectedVal}
              onChange={(e) => onJumpCategory(Number(e.target.value))}
            >
              {options.map((opt) => (
                <option key={opt.valueId} value={opt.valueId}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </header>
  )
}
