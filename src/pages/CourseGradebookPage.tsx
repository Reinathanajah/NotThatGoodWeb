import '../components/categories/categories.css'
import '../components/reports/reports.css'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import { CourseGradebookTable } from '../components/reports/CourseGradebookTable.tsx'
import { GradebookSummaryStrip } from '../components/reports/GradebookSummaryStrip.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { resolveCourseHref } from '../lib/appRoutes.ts'
import { fetchCourseGradebook } from '../services/gradesReportsApi.ts'
import type { CourseGradebookDto } from '../types/reports.ts'

export function CourseGradebookPage() {
  const params = useParams<{ id: string }>()
  const courseParam = params.id ?? ''
  const [reloadSeq, setReloadSeq] = useState(0)
  const [state, setState] = useState<{
    key: string
    data: CourseGradebookDto | null
    error: string | null
  }>({ key: '__init__', data: null, error: null })

  const activeKey = `${courseParam}::${reloadSeq}`
  const isLoading = state.key !== activeKey

  useDocumentTitle(state.data ? `${state.data.course.shortName} grades` : 'Course gradebook')

  useEffect(() => {
    if (!courseParam) return
    const controller = new AbortController()
    fetchCourseGradebook(courseParam, controller.signal).then(
      (data) => setState({ key: activeKey, data, error: null }),
      (err: unknown) => {
        if (controller.signal.aborted) return
        setState({
          key: activeKey,
          data: null,
          error: err instanceof Error ? err.message : 'Unable to load course gradebook',
        })
      },
    )
    return () => controller.abort()
  }, [activeKey, courseParam])

  const detail = state.data
  const courseHref = detail ? resolveCourseHref(detail.course) : `/courses/${courseParam}`

  return (
    <AppShell>
      {isLoading ? (
        <StatusBanner variant="loading" title="Loading course gradebook" skeletonLines={4} />
      ) : state.error || !detail ? (
        <StatusBanner
          variant="error"
          title="Could not load course gradebook"
          message={state.error ?? 'Gradebook data is unavailable for this course.'}
          actionLabel="Retry"
          onAction={() => setReloadSeq((prev) => prev + 1)}
        />
      ) : (
        <div className="sf-stack">
          <header className="sf-surface cat-header-card sf-stack" style={{ gap: 'var(--space-2)' }}>
            <nav aria-label="Gradebook breadcrumb">
              <ol className="cat-breadcrumb-list">
                <li className="cat-breadcrumb-item">
                  <Link href="/grades">Grades overview</Link>
                  <ChevronRight size={16} aria-hidden="true" />
                </li>
                <li className="cat-breadcrumb-item">
                  <Link href={courseHref}>{detail.course.shortName}</Link>
                  <ChevronRight size={16} aria-hidden="true" />
                </li>
                <li className="cat-breadcrumb-item" aria-current="page">
                  <span>Gradebook</span>
                </li>
              </ol>
            </nav>

            <div className="dash-controls">
              <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 280px' }}>
                <p className="sf-text-muted tabular-nums" style={{ fontWeight: 600 }}>
                  {detail.course.code}
                </p>
                <h1 className="sf-heading-display">{detail.course.title}</h1>
              </div>
              <Link href={courseHref} className="sf-btn sf-btn--secondary">
                Back to course
              </Link>
            </div>
          </header>

          <GradebookSummaryStrip
            ariaLabel="Course total summary"
            metrics={[
              {
                label: 'Course total',
                value: detail.courseTotal.formattedGrade,
                hint: 'Weighted score across visible items',
              },
              {
                label: 'Letter grade',
                value: detail.courseTotal.letterGrade ?? '-',
                hint: detail.courseTotal.score !== null ? 'Published letter standing' : 'Awaiting published score',
              },
              {
                label: 'Graded items',
                value: `${detail.courseTotal.gradedItemsCount}/${detail.courseTotal.totalItemsCount}`,
                hint: 'Visible student assessment items',
              },
            ]}
          />

          {detail.items.length === 0 ? (
            <StatusBanner
              variant="empty"
              title="No assessment items published"
              message="Your instructor has not published any gradebook items for this course yet."
            />
          ) : (
            <CourseGradebookTable
              courseTitle={detail.course.title}
              courseId={detail.course.moodleCourseId ?? detail.course.id}
              items={detail.items}
            />
          )}
        </div>
      )}
    </AppShell>
  )
}
