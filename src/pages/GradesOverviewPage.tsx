import '../components/reports/reports.css'
import { Award, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '../components/layout/AppShell.tsx'
import { GradebookSummaryStrip } from '../components/reports/GradebookSummaryStrip.tsx'
import { GradesOverviewTable } from '../components/reports/GradesOverviewTable.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { fetchGradesOverview } from '../services/gradesReportsApi.ts'
import type { GradesOverviewDto } from '../types/reports.ts'

export function GradesOverviewPage() {
  useDocumentTitle('Grades overview')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [reloadSeq, setReloadSeq] = useState(0)
  const [state, setState] = useState<{
    key: string
    data: GradesOverviewDto | null
    error: string | null
  }>({ key: '__init__', data: null, error: null })

  const activeKey = `${debouncedSearch}::${reloadSeq}`
  const isLoading = state.key !== activeKey

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 200)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    fetchGradesOverview(debouncedSearch, controller.signal).then(
      (data) => setState({ key: activeKey, data, error: null }),
      (err: unknown) => {
        if (controller.signal.aborted) return
        setState({
          key: activeKey,
          data: null,
          error: err instanceof Error ? err.message : 'Unable to load grades overview',
        })
      },
    )
    return () => controller.abort()
  }, [activeKey, debouncedSearch])

  const courses = state.data?.courses ?? []

  return (
    <AppShell>
      <header className="sf-surface cat-header-card sf-stack" style={{ gap: 'var(--space-2)' }}>
        <div className="sf-row">
          <Award size={22} aria-hidden="true" color="var(--accent)" />
          <h1 className="sf-heading-display">{state.data?.title ?? 'Courses I am taking'}</h1>
        </div>
        <p className="sf-text-muted">
          Final course grades and assessed progress across your active enrollments. Ungraded
          courses display a dash until an assessment score is published.
        </p>

        <div className="dash-controls">
          <div className="dash-search-wrap" style={{ flex: '1 1 260px', maxWidth: '420px' }}>
            <Search size={18} className="dash-search-icon" aria-hidden="true" />
            <label htmlFor="grades-course-search" className="sf-sr-only">
              Filter grades by course code or title
            </label>
            <input
              id="grades-course-search"
              type="search"
              className="sf-input dash-search-input"
              placeholder="Filter courses by code or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {searchInput ? (
            <button
              type="button"
              className="sf-btn sf-btn--secondary"
              onClick={() => {
                setSearchInput('')
                setDebouncedSearch('')
              }}
            >
              <X size={16} aria-hidden="true" />
              <span>Clear filter</span>
            </button>
          ) : null}
        </div>
      </header>

      {state.data ? (
        <GradebookSummaryStrip
          ariaLabel="Overall grade summary"
          metrics={[
            { label: 'Enrolled courses', value: String(state.data.summary.totalCourses) },
            { label: 'Courses with published grades', value: String(state.data.summary.gradedCourses) },
            { label: 'Courses shown', value: String(courses.length) },
          ]}
        />
      ) : null}

      {isLoading && !state.data ? (
        <StatusBanner variant="loading" title="Loading course grades" skeletonLines={4} />
      ) : state.error ? (
        <StatusBanner
          variant="error"
          title="Could not load grades overview"
          message={state.error}
          actionLabel="Retry"
          onAction={() => setReloadSeq((prev) => prev + 1)}
        />
      ) : courses.length === 0 ? (
        <StatusBanner
          variant="empty"
          title="No matching courses found"
          message={
            debouncedSearch
              ? 'No enrolled courses match your current filter.'
              : 'You do not have any active course enrollments with gradebook items.'
          }
        />
      ) : (
        <GradesOverviewTable courses={courses} />
      )}
    </AppShell>
  )
}
