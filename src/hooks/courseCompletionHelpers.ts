import type { CourseCompletionDto, CourseDetailDto } from '../types/courses.ts'

export function applyOptimisticModuleToggle(
  course: CourseDetailDto,
  moduleId: number,
  isCompleted: boolean,
  completedAt: string | null = null,
  courseCompletion?: CourseCompletionDto,
): CourseDetailDto {
  const prevMod = course.sections.flatMap((s) => s.modules).find((m) => m.id === moduleId)
  let nextCompletion = courseCompletion ?? course.completion
  if (!courseCompletion && prevMod && prevMod.isCompleted !== isCompleted && course.completion.totalTrackableModules > 0) {
    const delta = isCompleted ? 1 : -1
    const nextDone = Math.max(
      0,
      Math.min(course.completion.totalTrackableModules, course.completion.completedModules + delta),
    )
    nextCompletion = {
      ...course.completion,
      completedModules: nextDone,
      percentage: Math.round((nextDone / course.completion.totalTrackableModules) * 100),
    }
  }

  return {
    ...course,
    completion: nextCompletion,
    sections: course.sections.map((sec) => ({
      ...sec,
      modules: sec.modules.map((m) =>
        m.id === moduleId ? { ...m, isCompleted, completedAt } : m,
      ),
    })),
  }
}
