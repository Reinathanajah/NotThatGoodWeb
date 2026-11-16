import type { QuizQuestion } from '../../db/schema.js'
import { BadRequestError } from '../../utils/errors.js'

export function computeAttemptDeadline(
  closedAt: Date,
  startedAt: Date,
  timeLimitSeconds: number | null,
): Date {
  if (!timeLimitSeconds || timeLimitSeconds <= 0) {
    return closedAt
  }
  const limitEnd = new Date(startedAt.getTime() + timeLimitSeconds * 1000)
  return limitEnd.getTime() < closedAt.getTime() ? limitEnd : closedAt
}

export function resolveWindowStatus(opensAt: Date, closedAt: Date, nowMs: number) {
  if (nowMs < opensAt.getTime()) return 'not_opened' as const
  if (nowMs > closedAt.getTime()) return 'closed' as const
  return 'open' as const
}

export function sanitizeQuestions(questions: QuizQuestion[]) {
  return questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    points: q.points,
    tag: q.tag ?? null,
  }))
}

export function validateAndMergeAnswers(
  questions: QuizQuestion[],
  existing: Record<string, number>,
  incoming: Record<string, number>,
): Record<string, number> {
  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const merged = { ...existing }

  for (const [questionId, selectedIndex] of Object.entries(incoming)) {
    const question = questionMap.get(questionId)
    if (!question) {
      throw new BadRequestError(`Unknown question ID "${questionId}"`, [
        { field: `body.answers.${questionId}`, message: 'Question does not belong to this quiz' },
      ])
    }
    if (selectedIndex < 0 || selectedIndex >= question.options.length) {
      throw new BadRequestError(`Invalid option index for question "${questionId}"`, [
        {
          field: `body.answers.${questionId}`,
          message: `Selected index must be between 0 and ${question.options.length - 1}`,
        },
      ])
    }
    merged[questionId] = selectedIndex
  }

  return merged
}

export function scoreAttempt(
  questions: QuizQuestion[],
  answers: Record<string, number>,
  maxGradeStr: string,
) {
  let totalPoints = 0
  let earnedPoints = 0
  const breakdown: Array<{
    questionId: string
    selectedIndex: number | null
    correctIndex: number
    isCorrect: boolean
    pointsEarned: number
    pointsPossible: number
    tag: string | null
  }> = []

  for (const q of questions) {
    totalPoints += q.points
    const selected = answers[q.id] ?? null
    const isCorrect = selected === q.correctIndex
    const pointsEarned = isCorrect ? q.points : 0
    earnedPoints += pointsEarned

    breakdown.push({
      questionId: q.id,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      isCorrect,
      pointsEarned,
      pointsPossible: q.points,
      tag: q.tag ?? null,
    })
  }

  const maxGrade = Number(maxGradeStr) || 100
  const scaledScore =
    totalPoints > 0 ? Number(((earnedPoints / totalPoints) * maxGrade).toFixed(2)) : 0

  return {
    earnedPoints,
    totalPoints,
    maxGrade,
    scaledScore: scaledScore.toFixed(2),
    breakdown,
  }
}
