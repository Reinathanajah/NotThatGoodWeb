import type { AdjacentModulesDto, BreadcrumbDto } from './api.ts'

export interface QuizQuestionDto {
  id: string
  prompt: string
  options: string[]
  points: number
  tag: string | null
}

export interface QuizAttemptSummaryDto {
  id: string
  attemptNumber: number
  status: 'in_progress' | 'submitted' | 'expired'
  score: string | null
  startedAt: string
  submittedAt: string | null
  deadlineAt: string
}

export interface QuizDetailDto {
  moduleId: number
  moodleModuleId: number | null
  title: string
  subsectionLabel: string | null
  descriptionHtml: string | null
  opensAt: string
  closedAt: string
  timeLimitSeconds: number | null
  maxAttempts: number
  maxGrade: string
  questionCount: number
  windowStatus: 'not_opened' | 'open' | 'closed'
  canStartAttempt: boolean
  course: { id: number; moodleCourseId: number | null; code: string; title: string }
  section: { id: number; title: string; position: number } | null
  breadcrumbs: BreadcrumbDto[]
  attempts: QuizAttemptSummaryDto[]
  navigation: AdjacentModulesDto
}

export interface QuizAttemptSessionDto {
  attemptId: string
  quizModuleId: number
  attemptNumber: number
  status: 'in_progress' | 'submitted' | 'expired'
  startedAt: string
  deadlineAt: string
  answers: Record<string, number>
  questions: QuizQuestionDto[]
}

export interface QuizReviewItemDto {
  questionId: string
  selectedIndex: number | null
  correctIndex: number
  isCorrect: boolean
  pointsEarned: number
  pointsPossible: number
  tag: string | null
}

export interface QuizSubmitResultDto {
  attemptId: string
  quizModuleId: number
  attemptNumber: number
  status: 'submitted'
  submittedAt: string
  score: string
  maxGrade: string
  earnedPoints: number
  totalPoints: number
  review: QuizReviewItemDto[]
}
