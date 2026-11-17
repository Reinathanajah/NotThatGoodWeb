import { useEffect, useState } from 'react'
import { parseCourseProgressRows } from '../lib/reportRows.ts'
import { fetchAnalyticsReport } from '../services/gradesReportsApi.ts'
import { fetchLearnerScriptList } from '../services/widgetsApi.ts'
import type { LearnerScriptDetailDto, LearnerScriptListDto } from '../types/reports.ts'

export function useAnalyticsReport(rawKey: string, courseFilter: string) {
  const isManageView = rawKey === 'manage'
  const activeReportKey = isManageView ? 'student-progress' : rawKey
  const [reloadSeq, setReloadSeq] = useState(0)
  const [catalog, setCatalog] = useState<LearnerScriptListDto | null>(null)
  const [allCourseOpts, setAllCourseOpts] = useState<Array<{ id: number; label: string }>>([])
  const [detailState, setDetailState] = useState<{
    key: string
    data: LearnerScriptDetailDto | null
    error: string | null
  }>({ key: '__init__', data: null, error: null })

  const parsedCourseId = courseFilter ? Number(courseFilter) : undefined
  const activeKey = `${activeReportKey}::${courseFilter}::${reloadSeq}`
  const isLoading = !isManageView && detailState.key !== activeKey

  useEffect(() => {
    const controller = new AbortController()
    fetchLearnerScriptList(controller.signal).then(setCatalog, () => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (isManageView) return
    const controller = new AbortController()
    fetchAnalyticsReport(activeReportKey, parsedCourseId, controller.signal).then(
      (data) => {
        setDetailState({ key: activeKey, data, error: null })
        if (data.report.reportType === 'course_progress' && !parsedCourseId) {
          setAllCourseOpts(
            parseCourseProgressRows(data.rows).map((r) => ({
              id: r.moodleCourseId ?? r.courseId,
              label: `${r.courseCode} - ${r.courseTitle}`,
            })),
          )
        }
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setDetailState({
          key: activeKey,
          data: null,
          error: err instanceof Error ? err.message : 'Unable to load analytics report',
        })
      },
    )
    return () => controller.abort()
  }, [activeKey, activeReportKey, isManageView, parsedCourseId])

  return {
    isManageView,
    activeReportKey,
    catalog,
    allCourseOpts,
    detail: detailState.data,
    error: detailState.error,
    isLoading,
    retry: () => setReloadSeq((prev) => prev + 1),
  }
}
