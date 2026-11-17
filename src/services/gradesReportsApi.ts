import type {
  CourseGradebookDto,
  GradesOverviewDto,
  LearnerScriptDetailDto,
} from '../types/reports.ts'
import { apiFetch } from './apiClient.ts'

export function fetchGradesOverview(
  search?: string,
  signal?: AbortSignal,
): Promise<GradesOverviewDto> {
  const query = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  return apiFetch<GradesOverviewDto>(`/grades/overview${query}`, { signal })
}

export function fetchCourseGradebook(
  courseId: number | string,
  signal?: AbortSignal,
): Promise<CourseGradebookDto> {
  return apiFetch<CourseGradebookDto>(`/courses/${encodeURIComponent(String(courseId))}/grades`, {
    signal,
  })
}

export function fetchAnalyticsReport(
  key: string,
  courseId?: number,
  signal?: AbortSignal,
): Promise<LearnerScriptDetailDto> {
  const query = courseId ? `?courseId=${encodeURIComponent(String(courseId))}` : ''
  return apiFetch<LearnerScriptDetailDto>(
    `/reports/learner-script/${encodeURIComponent(key)}${query}`,
    { signal },
  )
}
