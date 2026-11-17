import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiClientError } from '../services/apiClient.ts'
import {
  fetchCourseDetail,
  recordCourseAccess,
  setCourseModuleCompletion,
  updateCoursePreference,
} from '../services/coursesApi.ts'
import type { CourseDetailDto } from '../types/courses.ts'
import { applyOptimisticModuleToggle } from './courseCompletionHelpers.ts'
import { useCourseSectionsState } from './useCourseSectionsState.ts'

export function useCourseDetail(courseId: number) {
  const [trackedCourseId, setTrackedCourseId] = useState(courseId)
  const [course, setCourse] = useState<CourseDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; status?: number } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingModules, setPendingModules] = useState<Set<number>>(() => new Set())
  const [togglingStar, setTogglingStar] = useState(false)
  const [nonce, setNonce] = useState(0)
  const accessPingedIdRef = useRef<number | null>(null)
  const {
    collapsedIds,
    initFromCourse,
    toggleSection,
    expandSection,
    setAllSectionsExpanded: setAllSectionsState,
  } = useCourseSectionsState()

  if (trackedCourseId !== courseId) {
    setTrackedCourseId(courseId)
    setCourse(null)
    setLoading(true)
    setError(null)
    setActionError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchCourseDetail(courseId, controller.signal).then(
      (payload) => {
        setCourse(payload)
        initFromCourse(payload)
        setError(null)
        setLoading(false)
        if (accessPingedIdRef.current !== payload.id) {
          accessPingedIdRef.current = payload.id
          void recordCourseAccess(payload.id).catch(() => {})
        }
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError({
          message: err instanceof Error ? err.message : 'Unable to load course',
          status: err instanceof ApiClientError ? err.statusCode : undefined,
        })
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [courseId, initFromCourse, nonce])

  const setAllSectionsExpanded = useCallback(
    (expanded: boolean) => setAllSectionsState(expanded, course),
    [course, setAllSectionsState],
  )

  const toggleStar = useCallback(async () => {
    if (!course || togglingStar) return
    const nextStar = !course.enrollment.isStarred
    setTogglingStar(true)
    setActionError(null)
    setCourse((prev) =>
      prev ? { ...prev, enrollment: { ...prev.enrollment, isStarred: nextStar } } : prev,
    )
    try {
      await updateCoursePreference(course.id, { isStarred: nextStar })
    } catch (err: unknown) {
      setCourse((prev) =>
        prev ? { ...prev, enrollment: { ...prev.enrollment, isStarred: !nextStar } } : prev,
      )
      setActionError(err instanceof Error ? err.message : 'Unable to update star preference')
    } finally {
      setTogglingStar(false)
    }
  }, [course, togglingStar])

  const toggleModuleCompletion = useCallback(
    async (moduleId: number, nextCompleted: boolean) => {
      if (!course || pendingModules.has(moduleId)) return
      const prevCourse = course
      setActionError(null)
      setPendingModules((prev) => new Set(prev).add(moduleId))
      setCourse((curr) =>
        curr ? applyOptimisticModuleToggle(curr, moduleId, nextCompleted) : curr,
      )

      try {
        const res = await setCourseModuleCompletion(course.id, moduleId, nextCompleted)
        setCourse((curr) =>
          curr
            ? applyOptimisticModuleToggle(
                curr,
                moduleId,
                res.isCompleted,
                res.completedAt,
                res.courseCompletion,
              )
            : curr,
        )
      } catch (err: unknown) {
        setCourse(prevCourse)
        setActionError(err instanceof Error ? err.message : 'Unable to update completion status')
      } finally {
        setPendingModules((prev) => {
          const next = new Set(prev)
          next.delete(moduleId)
          return next
        })
      }
    },
    [course, pendingModules],
  )

  return {
    course,
    loading,
    error,
    actionError,
    collapsedIds,
    pendingModules,
    togglingStar,
    toggleSection,
    expandSection,
    setAllSectionsExpanded,
    toggleStar,
    toggleModuleCompletion,
    retry: () => {
      setLoading(true)
      setError(null)
      setNonce((n) => n + 1)
    },
  }
}
