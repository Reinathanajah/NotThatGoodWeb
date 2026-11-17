import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/comms/comms.css'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'wouter'
import { ConversationListPane } from '../components/comms/ConversationListPane.tsx'
import { ConversationThreadPanel } from '../components/comms/ConversationThreadPanel.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAuth } from '../context/authContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useMessagingWorkspace } from '../hooks/useMessagingWorkspace.ts'

export function MessagesPage() {
  useDocumentTitle('Messages')
  const params = useParams<{ id?: string }>()
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const ws = useMessagingWorkspace(params.id)
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(params.id))

  return (
    <AppShell>
      <header className="sf-surface cat-header-card sf-stack">
        <h1 className="sf-heading-display sf-row">
          <MessageCircle size={28} color="var(--accent)" aria-hidden="true" />
          <span>Messages</span>
        </h1>
        <p className="sf-text-muted">Direct conversations with course instructors and classmates.</p>
      </header>

      {ws.error ? (
        <StatusBanner variant="error" title="Could not load messages" message={ws.error} />
      ) : ws.loadingList ? (
        <StatusBanner variant="loading" title="Loading conversations" skeletonLines={4} />
      ) : (
        <div className="msg-split">
          <ConversationListPane
            conversations={ws.conversations}
            selectedId={ws.selectedId}
            currentUserId={user?.id}
            timeZone={tz}
            hiddenOnMobile={mobileShowThread && Boolean(ws.selectedId)}
            onSelect={(id) => {
              ws.setSelectedId(id)
              setMobileShowThread(true)
            }}
          />
          <ConversationThreadPanel
            selectedId={ws.selectedId}
            thread={ws.thread}
            currentUserId={user?.id}
            timeZone={tz}
            hiddenOnMobile={!mobileShowThread}
            loading={ws.loadingThread}
            hasMore={ws.hasMore}
            sending={ws.sending}
            error={ws.threadError}
            onBackToList={() => setMobileShowThread(false)}
            onLoadOlder={() => void ws.loadOlder()}
            onSend={ws.sendMessage}
          />
        </div>
      )}
    </AppShell>
  )
}
