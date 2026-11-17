import { Send } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useState } from 'react'

export function MessageComposerForm({
  sending,
  onSend,
}: {
  sending: boolean
  onSend: (body: string) => Promise<boolean>
}) {
  const [draft, setDraft] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function trySend() {
    const trimmed = draft.trim()
    if (!trimmed) {
      setLocalError('Write a message before sending.')
      return
    }
    setLocalError(null)
    if (await onSend(trimmed)) setDraft('')
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

  return (
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
      {localError ? <p className="foundation-field-error" role="alert">{localError}</p> : null}
      <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="sf-btn sf-btn--primary" disabled={sending}>
          <Send size={16} aria-hidden="true" />
          <span>{sending ? 'Sending...' : 'Send message'}</span>
        </button>
      </div>
    </form>
  )
}
