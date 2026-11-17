import type { QuizDetailDto } from '../types/quizzes.ts'

export function computeSecondsRemaining(deadlineIso: string, nowMs = Date.now()): number {
  const diff = Math.floor((new Date(deadlineIso).getTime() - nowMs) / 1000)
  return Math.max(0, diff)
}

export function formatCountdownHms(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`
}

export function formatDurationMinutes(seconds: number | null): string {
  if (!seconds || seconds <= 0) return 'Untimed'
  const mins = Math.round(seconds / 60)
  return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`
}

export function hasActiveInProgressAttempt(detail: QuizDetailDto): boolean {
  return detail.attempts.some((a) => a.status === 'in_progress')
}
