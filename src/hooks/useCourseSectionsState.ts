import { useCallback, useState } from 'react'
import type { CourseDetailDto } from '../types/courses.ts'

export function useCourseSectionsState() {
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(() => new Set())

  const initFromCourse = useCallback((payload: CourseDetailDto) => {
    setCollapsedIds(
      new Set(payload.sections.filter((s) => s.isCollapsedDefault).map((s) => s.id)),
    )
  }, [])

  const toggleSection = useCallback((sectionId: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }, [])

  const expandSection = useCallback((sectionId: number) => {
    setCollapsedIds((prev) => {
      if (!prev.has(sectionId)) return prev
      const next = new Set(prev)
      next.delete(sectionId)
      return next
    })
  }, [])

  const setAllSectionsExpanded = useCallback(
    (expanded: boolean, course: CourseDetailDto | null) => {
      setCollapsedIds((prev) => {
        if (expanded) return new Set()
        if (!course) return prev
        return new Set(course.sections.map((s) => s.id))
      })
    },
    [],
  )

  return {
    collapsedIds,
    initFromCourse,
    toggleSection,
    expandSection,
    setAllSectionsExpanded,
  }
}
