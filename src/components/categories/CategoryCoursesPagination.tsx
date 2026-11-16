import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CategoryPageSize } from '../../hooks/useCategoryExplorer.ts'

interface CategoryCoursesPaginationProps {
  page: number
  totalPages: number
  limit: CategoryPageSize
  loading: boolean
  onChangeLimit: (next: CategoryPageSize) => void
  onChangePage: (next: number) => void
}

export function CategoryCoursesPagination({
  page,
  totalPages,
  limit,
  loading,
  onChangeLimit,
  onChangePage,
}: CategoryCoursesPaginationProps) {
  return (
    <div className="sf-row" style={{ justifyContent: 'space-between' }}>
      <div className="sf-row">
        <label htmlFor="cat-page-size" className="sf-text-muted" style={{ fontWeight: 600 }}>
          Per page
        </label>
        <select
          id="cat-page-size"
          className="dash-select"
          value={limit}
          onChange={(e) => onChangeLimit(Number(e.target.value) as CategoryPageSize)}
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
        </select>
      </div>

      <div className="sf-row">
        <span className="sf-text-muted tabular-nums">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          aria-label="Previous category page"
          disabled={page <= 1 || loading}
          onClick={() => onChangePage(page - 1)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          aria-label="Next category page"
          disabled={page >= totalPages || loading}
          onClick={() => onChangePage(page + 1)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
