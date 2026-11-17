import type {
  QuizAttemptSessionDto,
  QuizDetailDto,
  QuizSubmitResultDto,
} from '../types/quizzes.ts'
import { apiFetch } from './apiClient.ts'

export function fetchQuizDetail(
  moduleId: number,
  signal?: AbortSignal,
): Promise<QuizDetailDto> {
  return apiFetch<QuizDetailDto>(`/quizzes/${moduleId}`, { signal })
}

export function startOrResumeQuizAttempt(moduleId: number): Promise<QuizAttemptSessionDto> {
  return apiFetch<QuizAttemptSessionDto>(`/quizzes/${moduleId}/attempts`, { method: 'POST' })
}

export function saveQuizAttemptAnswers(
  attemptId: string,
  answers: Record<string, number>,
): Promise<{ attemptId: string; status: string; answers: Record<string, number>; deadlineAt: string }> {
  return apiFetch(`/quizzes/attempts/${attemptId}/answers`, {
    method: 'PATCH',
    body: { answers },
  })
}

export function submitQuizAttempt(
  attemptId: string,
  answers: Record<string, number>,
): Promise<QuizSubmitResultDto> {
  return apiFetch<QuizSubmitResultDto>(`/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: { answers },
  })
}
