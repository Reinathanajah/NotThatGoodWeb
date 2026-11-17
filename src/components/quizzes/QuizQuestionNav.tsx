import type { QuizQuestionDto } from '../../types/quizzes.ts'

interface QuizQuestionNavProps {
  questions: QuizQuestionDto[]
  answers: Record<string, number>
  currentIndex: number
  onSelectIndex: (index: number) => void
}

export function QuizQuestionNav({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
}: QuizQuestionNavProps) {
  return (
    <aside className="sf-surface res-stage-card sf-stack" aria-label="Question navigator">
      <h2 className="sf-text-muted" style={{ fontWeight: 600 }}>
        Quiz navigation
      </h2>
      <div className="quiz-q-grid">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined
          const isCurrent = idx === currentIndex
          return (
            <button
              key={q.id}
              type="button"
              className={`quiz-q-btn${isAnswered ? ' quiz-q-btn--answered' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Question ${idx + 1}, ${isAnswered ? 'answered' : 'unanswered'}`}
              onClick={() => onSelectIndex(idx)}
            >
              <span>{idx + 1}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
