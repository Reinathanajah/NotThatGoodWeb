import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../../context/authContextValue.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import type { SubmissionCommentDto } from '../../types/activities.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface SubmissionCommentsPanelProps {
  comments: SubmissionCommentDto[]
  submitting: boolean
  commentError: string | null
  onSubmitComment: (body: string) => Promise<boolean>
}

export function SubmissionCommentsPanel({
  comments,
  submitting,
  commentError,
  onSubmitComment,
}: SubmissionCommentsPanelProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const [expanded, setExpanded] = useState(true)
  const [draft, setDraft] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) {
      setValidationError('Write a short message before posting a comment.')
      return
    }
    setValidationError(null)
    const ok = await onSubmitComment(trimmed)
    if (ok) {
      setDraft('')
    }
  }

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-labelledby="comments-heading">
      <button
        type="button"
        className="course-section-trigger"
        style={{ padding: 0 }}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <MessageSquare size={18} color="var(--accent)" aria-hidden="true" />
          <h2 id="comments-heading" className="sf-heading-section">
            Submission comments ({comments.length})
          </h2>
        </span>
        {expanded ? (
          <ChevronUp size={18} aria-hidden="true" />
        ) : (
          <ChevronDown size={18} aria-hidden="true" />
        )}
      </button>

      {expanded ? (
        <div className="sf-stack">
          {comments.length === 0 ? (
            <p className="sf-text-muted">No comments posted for this submission yet.</p>
          ) : (
            <ul className="assign-comment-list">
              {comments.map((comment) => (
                <li key={comment.id} className="assign-comment-card">
                  <div className="sf-row" style={{ justifyContent: 'space-between' }}>
                    <strong>
                      {comment.author.fullName}{' '}
                      <span className="sf-text-muted">({comment.author.role})</span>
                    </strong>
                    <span className="sf-text-muted tabular-nums">
                      {formatDateTimeShort(comment.createdAt, tz)}
                    </span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{comment.body}</p>
                </li>
              ))}
            </ul>
          )}

          {commentError ? (
            <StatusBanner variant="error" title="Could not save comment" message={commentError} />
          ) : null}

          <form className="sf-stack" style={{ gap: 'var(--space-2)' }} onSubmit={handleSubmit}>
            <label htmlFor="assign-comment-input" className="sf-text-muted" style={{ fontWeight: 600 }}>
              Add a submission comment
            </label>
            <textarea
              id="assign-comment-input"
              className="assign-comment-textarea"
              value={draft}
              maxLength={2000}
              disabled={submitting}
              aria-invalid={validationError ? 'true' : undefined}
              placeholder="Write a note for your instructor or confirm your submission details"
              onChange={(e) => {
                setDraft(e.target.value)
                if (validationError) setValidationError(null)
              }}
            />
            {validationError ? (
              <p className="foundation-field-error" role="alert">
                {validationError}
              </p>
            ) : null}
            <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="sf-btn sf-btn--primary" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
