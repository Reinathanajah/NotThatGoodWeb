import { CheckSquare, X } from 'lucide-react'
import { useRef } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'

interface QuizSubmitModalProps {
  open: boolean
  answeredCount: number
  totalCount: number
  submitting: boolean
  onConfirmSubmit: () => void
  onClose: () => void
}

export function QuizSubmitModal({
  open,
  answeredCount,
  totalCount,
  submitting,
  onConfirmSubmit,
  onClose,
}: QuizSubmitModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(open, dialogRef, onClose)

  if (!open) return null

  const unanswered = Math.max(0, totalCount - answeredCount)

  return (
    <div
      className="fp-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="fp-dialog"
        style={{ width: 'min(520px, 100%)', maxHeight: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-submit-title"
        tabIndex={-1}
      >
        <div className="fp-header">
          <h2 id="quiz-submit-title" className="sf-heading-section sf-row">
            <CheckSquare size={20} color="var(--accent)" aria-hidden="true" />
            <span>Submit quiz attempt</span>
          </h2>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            aria-label="Cancel submit"
            disabled={submitting}
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="fp-panel sf-stack">
          <p className="tabular-nums">
            You have answered <strong>{answeredCount}</strong> of <strong>{totalCount}</strong>{' '}
            questions. Once submitted, your score is recorded directly into the course gradebook.
          </p>
          {unanswered > 0 ? (
            <p className="sf-text-muted tabular-nums" style={{ color: 'var(--status-warning)' }}>
              {unanswered} {unanswered === 1 ? 'question remains' : 'questions remain'} unanswered.
            </p>
          ) : null}

          <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="sf-btn sf-btn--ghost"
              disabled={submitting}
              onClick={onClose}
            >
              Return to attempt
            </button>
            <button
              type="button"
              className="sf-btn sf-btn--primary"
              disabled={submitting}
              onClick={onConfirmSubmit}
            >
              {submitting ? 'Submitting...' : 'Submit all and finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
