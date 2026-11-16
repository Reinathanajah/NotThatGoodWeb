import type { AdjacentModulesDto, BreadcrumbDto } from './api.ts'

export interface AssignmentFileDto {
  id: string
  originalName: string
  displayName: string
  mimeType: string
  sizeBytes: number
  authorName: string | null
  license: string
  uploadedAt: string
  attachedAt: string
}

export interface PlagiarismJobDto {
  id: string
  submissionId: string
  provider: string
  status: 'pending' | 'scanning' | 'completed' | 'failed'
  similarityPercent: number | null
  reportSummary: string | null
  updatedAt: string
}

export interface AssignmentDetailDto {
  moduleId: number
  moodleModuleId: number | null
  title: string
  subsectionLabel: string | null
  descriptionHtml: string | null
  opensAt: string | null
  dueAt: string
  cutoffAt: string | null
  rules: {
    maxFiles: number
    maxFileSizeBytes: number
    requireSubmissionStatement: boolean
    submissionStatementText: string | null
    plagiarismProvider: string | null
    maxAttempts: number
    maxGrade: number
  }
  course: { id: number; moodleCourseId: number | null; code: string; title: string }
  section: { id: number; title: string; position: number } | null
  breadcrumbs: BreadcrumbDto[]
  submissionStatus: {
    submissionId: string | null
    attemptNumber: number
    status: 'none' | 'draft' | 'submitted' | 'submitted_late'
    gradingStatus: 'not_graded' | 'graded'
    onlineText: string | null
    declarationAccepted: boolean
    declarationAcceptedAt: string | null
    submittedAt: string | null
    lastModifiedAt: string | null
    timeRemaining: { isOverdue: boolean; label: string; seconds: number }
    files: AssignmentFileDto[]
    commentCount: number
    grade: { score: string; maxGrade: string; feedback: string | null; gradedAt: string | null } | null
    plagiarismJobs: PlagiarismJobDto[]
  }
  navigation: AdjacentModulesDto
}

export interface SubmissionCommentDto {
  id: string
  body: string
  createdAt: string
  author: { id: string; fullName: string; role: string }
}

export interface UpsertSubmissionInput {
  action: 'draft' | 'submit'
  onlineText?: string | null
  fileIds: string[]
  declarationAccepted: boolean
}

export interface QuizQuestionDto {
  id: string
  prompt: string
  options: string[]
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
  windowStatus: 'not_open' | 'open' | 'closed'
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
