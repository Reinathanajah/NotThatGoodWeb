import '../components/categories/categories.css'
import { Link, useLocation, useParams, useSearch } from 'wouter'
import { CategoryBreadcrumbHeader } from '../components/categories/CategoryBreadcrumbHeader.tsx'
import { CategoryCoursesPanel } from '../components/categories/CategoryCoursesPanel.tsx'
import { CategoryTreeNav } from '../components/categories/CategoryTreeNav.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useCategoryExplorer } from '../hooks/useCategoryExplorer.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { resolveCategoryHref } from '../lib/appRoutes.ts'

export function CategoryExplorerPage() {
  const params = useParams<{ id?: string }>()
  const search = useSearch()
  const [, setLocation] = useLocation()

  const queryCatId = Number(new URLSearchParams(search).get('categoryid'))
  const paramCatId = Number(params.id)
  const resolvedId =
    Number.isInteger(paramCatId) && paramCatId > 0
      ? paramCatId
      : Number.isInteger(queryCatId) && queryCatId > 0
        ? queryCatId
        : 1

  const explorer = useCategoryExplorer(resolvedId)
  const categoryName = explorer.detail?.category.name ?? 'Academic directory'
  useDocumentTitle(categoryName)

  const ancestorIds = explorer.detail?.ancestors.map((a) => a.id) ?? []
  const subcategories = explorer.detail?.children ?? []

  return (
    <AppShell>
      {explorer.detailError ? (
        <StatusBanner
          variant="error"
          title="Could not load category"
          message={explorer.detailError}
          actionLabel="Retry category"
          onAction={explorer.retryDetail}
        />
      ) : null}

      <CategoryBreadcrumbHeader
        detail={explorer.detail}
        tree={explorer.tree}
        activeCategoryId={resolvedId}
        onJumpCategory={(nextId) => setLocation(`/categories/${nextId}`)}
      />

      <div className="cat-explorer-layout">
        <CategoryTreeNav
          tree={explorer.tree}
          activeCategoryId={explorer.detail?.category.id ?? resolvedId}
          ancestorIds={ancestorIds}
        />

        <div className="sf-stack">
          {subcategories.length > 0 ? (
            <section
              className="sf-surface dash-section-card sf-stack"
              aria-labelledby="subcat-heading"
            >
              <h2 id="subcat-heading" className="sf-heading-section">
                Subcategories ({subcategories.length})
              </h2>
              <div className="cat-subcat-grid">
                {subcategories.map((child) => (
                  <Link
                    key={child.id}
                    href={resolveCategoryHref(child)}
                    className="cat-subcat-tile motion-surface"
                  >
                    <strong>{child.name}</strong>
                    <span className="sf-text-muted tabular-nums">
                      {child.directCourseCount} direct courses
                      {child.childCount ? ` · ${child.childCount} subprograms` : ''}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <CategoryCoursesPanel
            courses={explorer.courses}
            loading={explorer.coursesLoading}
            error={explorer.coursesError}
            searchInput={explorer.searchInput}
            includeSubcategories={explorer.includeSubcategories}
            page={explorer.page}
            totalPages={explorer.totalPages}
            total={explorer.total}
            limit={explorer.limit}
            onChangeSearch={explorer.changeSearch}
            onToggleIncludeSubcategories={explorer.toggleIncludeSubcategories}
            onChangeLimit={explorer.changeLimit}
            onChangePage={explorer.changePage}
            onRetry={explorer.retryCourses}
          />
        </div>
      </div>
    </AppShell>
  )
}
