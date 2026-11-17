import { ArrowLeft, Send } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useState } from 'react'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import type { ConversationDetailDto } from '../../types/workspace.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface ConversationThreadPanelProps {
  selectedId: string | null
  thread: ConversationDetailDto | null
  currentUserId: string | undefined
  timeZone: string
  hiddenOnMobile: boolean
  loading: boolean
  hasMore: boolean
  sending: boolean
  error: string | null
  onBackToList: () => void
  onLoadOlder: () => void
  onSend: (body: string) => Promise<boolean>
}

export function ConversationThreadPanel({
  selectedId,
  thread,
  currentUserId,
  timeZone,
  hiddenOnMobile,
  loading,
  hasMore,
  sending,
  error,
  onBackToList,
  onLoadOlder,
  onSend,
}: ConversationThreadPanelProps) {
  const [draft, setDraft] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function trySend() {
    const trimmed = draft.trim()
    if (!trimmed) {
      setLocalError('Write a message before sending.')
      return
    }
    setLocalError(null)
    const ok = await onSend(trimmed)
    if (ok) setDraft('')
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void trySend()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void trySend()
    }
  }

  if (!selectedId) {
    return (
      <section className="sf-surface res-stage-card msg-mobile-hidden">
        <p className="sf-text-muted">Select a conversation to view and send messages.</p>
      </section>
    )
  }

  return (
    <section
      className={`sf-surface res-stage-card sf-stack${hiddenOnMobile ? ' msg-mobile-hidden' : ''}`}
      aria-label="Active message thread"
    >
      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="sf-btn sf-btn--secondary msg-mobile-back" onClick={onBackToList}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back</span>
        </button>
        {thread ? (
          <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
            <strong>{thread.conversation.title ?? 'Direct messages'}</strong>
            {thread.participants.map((p) => (
              <span key={p.id} className="sf-badge">
                {p.fullName} ({p.role})
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <StatusBanner variant="error" title="Message error" message={error} /> : null}

      {loading && !thread ? (
        <StatusBanner variant="loading" title="Loading conversation" skeletonLines={4} />
      ) : thread ? (
        <>
          {hasMore ? (
            <button type="button" className="sf-btn sf-btn--secondary" onClick={onLoadOlder}>
              Load more messages
            </button>
          ) : null}

          <div className="msg-stream">
            {thread.messages.map((msg) => {
              const mine = msg.sender.id === currentUserId
              return (
                <article key={msg.id} className={`msg-bubble${mine ? ' msg-bubble--mine' : ''}`}>
                  <div className="sf-row" style={{ justifyContent: 'space-between' }}>
                    <strong>{mine ? `${msg.sender.fullName} (You)` : msg.sender.fullName}</strong>
                    <span className="sf-text-muted tabular-nums">
                      {formatDateTimeShort(msg.createdAt, timeZone)}
                    </span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{msg.body}</p>
                </article>
              )
            })}
          </div>

          <form className="sf-stack" style={{ gap: 'var(--space-2)' }} onSubmit={handleFormSubmit}>
            <label htmlFor="msg-composer" className="sf-text-muted" style={{ fontWeight: 600 }}>
              Write a message (Enter sends, Shift+Enter adds a line)
            </label>
            <textarea
              id="msg-composer"
              className="assign-comment-textarea"
              value={draft}
              maxLength={4000}
              disabled={sending}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setDraft(e.target.value)
                if (localError) setLocalError(null)
              }}
            />
            {localError ? (
              <p className="foundation-field-error" role="alert">
                {localError}
              </p>
            ) : null}
            <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="sf-btn sf-btn--primary" disabled={sending}>
                <Send size={16} aria-hidden="true" />
                <span>{sending ? 'Sending...' : 'Send message'}</span>
              </button>
            </div>
          </form>
        </>
      ) : null}
    </section>
  )
}
