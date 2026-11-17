import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { AutosaveState } from '../../hooks/useQuizAutosave.ts'
import { formatCountdownHms } from '../../lib/quizTimer.ts'
import type { QuizAttemptSessionDto } from '../../types/quizzes.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { QuizQuestionNav } from './QuizQuestionNav.tsx'

interface QuizRunnerViewProps {
  quizTitle: string
  session: QuizAttemptSessionDto
  answers: Record<string, number>
  saveState: AutosaveState
  secondsLeft: number
  submitting: boolean
  actionError: string | null
  onSelectOption: (questionId: string, optionIndex: number) => void
  onRetrySave: () => void
  onOpenSubmitModal: () => void
}

export function QuizRunnerView({
  quizTitle,
  session,
  answers,
  saveState,
  secondsLeft,
  submitting,
  actionError,
  onSelectOption,
  onRetrySave,
  onOpenSubmitModal,
}: QuizRunnerViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const questions = session.questions
  const clampedIndex = Math.min(currentIndex, Math.max(0, questions.length - 1))
  const activeQuestion = questions[clampedIndex]
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length

  return (
    <div className="sf-stack">
      <header className="sf-surface cat-header-card dash-controls">
        <div className="sf-stack" style={{ gap: '4px' }}>
          <h1 className="sf-heading-section">{quizTitle}</h1>
          <span className="sf-text-muted tabular-nums">
            Attempt #{session.attemptNumber} · {answeredCount} of {questions.length} answered
          </span>
        </div>

        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <span
            className={`assign-state-chip tabular-nums${secondsLeft <= 120 ? ' assign-state-chip--error' : ''}`}
            aria-live="off"
          >
            <Clock size={15} aria-hidden="true" />
            <span>{formatCountdownHms(secondsLeft)}</span>
          </span>

          {saveState === 'error' ? (
            <button type="button" className="sf-btn sf-btn--secondary" onClick={onRetrySave}>
              <AlertCircle size={15} color="var(--status-error)" aria-hidden="true" />
              <span>Retry save</span>
            </button>
          ) : (
            <span className="assign-state-chip">
              {saveState === 'saving' ? (
                <RefreshCw size={14} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={14} aria-hidden="true" />
              )}
              <span>{saveState === 'saving' ? 'Saving...' : 'Saved'}</span>
            </span>
          )}

          <button
            type="button"
            className="sf-btn sf-btn--primary"
            disabled={submitting}
            onClick={onOpenSubmitModal}
          >
            Finish attempt
          </button>
        </div>
      </header>

      {actionError ? <StatusBanner variant="error" title="Submission issue" message={actionError} /> : null}

      <div className="quiz-runner-grid">
        <QuizQuestionNav
          questions={questions}
          answers={answers}
          currentIndex={clampedIndex}
          onSelectIndex={setCurrentIndex}
        />

        {activeQuestion ? (
          <section className="sf-surface res-stage-card sf-stack" aria-label="Active question">
            <div className="sf-row" style={{ justifyContent: 'space-between' }}>
              <span className="sf-text-muted tabular-nums" style={{ fontWeight: 600 }}>
                Question {clampedIndex + 1} of {questions.length} · {activeQuestion.points} pts
              </span>
              {activeQuestion.tag ? <span className="sf-badge">{activeQuestion.tag}</span> : null}
            </div>

            <fieldset className="sf-stack" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                {activeQuestion.prompt}
              </legend>
              <div className="quiz-options-list">
                {activeQuestion.options.map((opt, optIdx) => (
                  <label key={optIdx} className="quiz-option-card">
                    <input
                      type="radio"
                      name={`q-${activeQuestion.id}`}
                      checked={answers[activeQuestion.id] === optIdx}
                      disabled={submitting}
                      onChange={() => onSelectOption(activeQuestion.id, optIdx)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sf-row" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                disabled={clampedIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              >
                Previous question
              </button>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                disabled={clampedIndex >= questions.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              >
                Next question
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
