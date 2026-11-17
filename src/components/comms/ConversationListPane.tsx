import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import type { ConversationSummaryDto } from '../../types/workspace.ts'

interface ConversationListPaneProps {
  conversations: ConversationSummaryDto[]
  selectedId: string | null
  currentUserId: string | undefined
  timeZone: string
  hiddenOnMobile: boolean
  onSelect: (id: string) => void
}

function getConversationTitle(conv: ConversationSummaryDto, currentUserId?: string): string {
  if (conv.title) return conv.title
  const others = conv.participants.filter((p) => p.id !== currentUserId)
  return others.map((p) => p.fullName).join(', ') || 'Direct conversation'
}

export function ConversationListPane({
  conversations,
  selectedId,
  currentUserId,
  timeZone,
  hiddenOnMobile,
  onSelect,
}: ConversationListPaneProps) {
  return (
    <aside
      className={`sf-surface res-stage-card sf-stack${hiddenOnMobile ? ' msg-mobile-hidden' : ''}`}
      aria-label="Conversations"
    >
      <h2 className="sf-heading-section" style={{ fontSize: 'var(--text-h3)' }}>
        Conversations ({conversations.length})
      </h2>
      {conversations.length === 0 ? (
        <p className="sf-text-muted">No message threads started yet.</p>
      ) : (
        <ul className="assign-file-list">
          {conversations.map((conv) => {
            const label = getConversationTitle(conv, currentUserId)
            const sender = conv.lastMessage
              ? conv.participants.find((p) => p.id === conv.lastMessage?.senderUserId)?.fullName
              : null

            return (
              <li key={conv.id}>
                <button
                  type="button"
                  className={`msg-conv-btn${conv.id === selectedId ? ' msg-conv-btn--active' : ''}`}
                  aria-current={conv.id === selectedId ? 'true' : undefined}
                  onClick={() => onSelect(conv.id)}
                >
                  <strong>{label}</strong>
                  {conv.lastMessage ? (
                    <>
                      <span className="sf-text-muted">
                        {sender ? `${sender}: ` : ''}
                        {conv.lastMessage.body.slice(0, 72)}
                      </span>
                      <span className="sf-text-muted tabular-nums">
                        {formatDateTimeShort(conv.lastMessage.createdAt, timeZone)}
                      </span>
                    </>
                  ) : (
                    <span className="sf-text-muted">No messages yet</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
