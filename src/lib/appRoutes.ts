export function resolveCourseHref(course: { id: number; moodleCourseId: number | null }): string {
  return `/courses/${course.moodleCourseId ?? course.id}`
}

export function resolveCategoryHref(cat: { id: number; moodleCategoryId?: number | null }): string {
  return `/categories/${cat.moodleCategoryId ?? cat.id}`
}

export function resolveModuleHref(mod: {
  id?: number
  moduleId?: number
  moodleModuleId: number | null
  courseId?: number
  moduleType: string
}): string {
  const targetId = mod.moodleModuleId ?? mod.moduleId ?? mod.id ?? 0
  if (mod.moduleType === 'assign') return `/assignments/${targetId}`
  if (mod.moduleType === 'quiz') return `/quizzes/${targetId}`
  if (mod.moduleType === 'resource' || mod.moduleType === 'url') return `/resources/${targetId}`
  return mod.courseId ? `/courses/${mod.courseId}` : '/my'
}
