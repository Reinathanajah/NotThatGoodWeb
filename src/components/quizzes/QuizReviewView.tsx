import { CheckCircle2, XCircle } from 'lucide-react'
import { Link } from 'wouter'
import type { QuizAttemptSessionDto, QuizSubmitResultDto } from '../../types/quizzes.ts'

interface QuizReviewViewProps {
  quizTitle: string
  session: QuizAttemptSessionDto
  result: QuizSubmitResultDto
  onBackToSummary: () => void
}

export function QuizReviewView({
  quizTitle,
  session,
  result,
  onBackToSummary,
}: QuizReviewViewProps) {
  const questionMap = new Map(session.questions.map((q) => [q.id, q]))

  return (
    <div className="sf-stack">
      <header className="sf-surface cat-header-card sf-stack">
        <h1 className="sf-heading-display">{quizTitle}: Graded review</h1>
        <p className="tabular-nums" style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
          Grade: {result.score} / {result.maxGrade} · Raw points: {result.earnedPoints} /{' '}
          {result.totalPoints} (Attempt #{result.attemptNumber})
        </p>
        <div className="sf-row">
          <button type="button" className="sf-btn sf-btn--primary" onClick={onBackToSummary}>
            Finish review
          </button>
          <Link href="/grades" className="sf-btn sf-btn--secondary">
            Open grades overview
          </Link>
        </div>
      </header>

      <section className="sf-surface res-stage-card sf-stack" aria-label="Question review breakdown">
        {result.review.map((item, idx) => {
          const question = questionMap.get(item.questionId)
          const selectedLabel =
            item.selectedIndex !== null
              ? (question?.options[item.selectedIndex] ?? 'Invalid selection')
              : 'Not answered'
          const correctLabel = question?.options[item.correctIndex] ?? `Option ${item.correctIndex + 1}`

          return (
            <article
              key={item.questionId}
              className={`quiz-review-item ${item.isCorrect ? 'quiz-review-item--correct' : 'quiz-review-item--wrong'}`}
            >
              <div className="sf-row" style={{ justifyContent: 'space-between' }}>
                <span className="sf-row" style={{ gap: 'var(--space-2)', fontWeight: 600 }}>
                  {item.isCorrect ? (
                    <CheckCircle2 size={18} color="var(--status-success)" aria-hidden="true" />
                  ) : (
                    <XCircle size={18} color="var(--status-error)" aria-hidden="true" />
                  )}
                  <span>
                    Question {idx + 1} · {item.pointsEarned} / {item.pointsPossible} pts
                  </span>
                </span>
                {item.tag ? <span className="sf-badge">{item.tag}</span> : null}
              </div>

              <p style={{ fontWeight: 600 }}>{question?.prompt ?? item.questionId}</p>
              <p className="sf-text-muted">Your answer: {selectedLabel}</p>
              {!item.isCorrect ? (
                <p className="sf-text-muted" style={{ color: 'var(--text-primary)' }}>
                  Correct answer: {correctLabel}
                </p>
              ) : null}
            </article>
          )
        })}
      </section>
    </div>
  )
}
