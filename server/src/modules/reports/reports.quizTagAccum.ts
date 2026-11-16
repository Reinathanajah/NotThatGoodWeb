import type { QuizQuestion } from '../../db/schema.js'
import type { ReportColumn } from './reports.queries.js'

export const QUIZ_TAG_COLUMNS: ReportColumn[] = [
  { key: 'tag', label: 'Question Tag' },
  { key: 'quizzesCount', label: 'Quizzes' },
  { key: 'questionsCount', label: 'Questions' },
  { key: 'attemptedQuestionsCount', label: 'Attempted' },
  { key: 'correctCount', label: 'Correct' },
  { key: 'accuracyPercent', label: 'Accuracy (%)' },
  { key: 'avgDurationSeconds', label: 'Avg Duration (s)' },
]

export interface TagAccumulator {
  quizIds: Set<number>
  questionsCount: number
  attemptedQuestionsCount: number
  correctCount: number
  durationsSeconds: number[]
}

export function accumulateQuizTags(
  quizRows: Array<{ moduleId: number; questionsJson: QuizQuestion[] }>,
  attemptsByQuiz: Map<
    number,
    Array<{
      answersJson: Record<string, number>
      startedAt: Date
      submittedAt: Date | null
    }>
  >,
) {
  const tagMap = new Map<string, TagAccumulator>()

  for (const quiz of quizRows) {
    const attempts = attemptsByQuiz.get(quiz.moduleId) ?? []
    for (const question of quiz.questionsJson) {
      const tagName = question.tag?.trim() || 'Untagged'
      const acc = tagMap.get(tagName) ?? {
        quizIds: new Set<number>(),
        questionsCount: 0,
        attemptedQuestionsCount: 0,
        correctCount: 0,
        durationsSeconds: [],
      }
      acc.quizIds.add(quiz.moduleId)
      acc.questionsCount += 1

      for (const att of attempts) {
        const selectedIndex = att.answersJson[question.id]
        if (selectedIndex === undefined) continue
        acc.attemptedQuestionsCount += 1
        if (selectedIndex === question.correctIndex) acc.correctCount += 1
        if (att.submittedAt) {
          acc.durationsSeconds.push(
            Math.max(0, Math.round((att.submittedAt.getTime() - att.startedAt.getTime()) / 1000)),
          )
        }
      }

      tagMap.set(tagName, acc)
    }
  }

  return tagMap
}
