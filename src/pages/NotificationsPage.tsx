import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/files/privateFiles.css'
import '../components/comms/comms.css'
import { Bell, CheckCheck } from 'lucide-react'
import { Link } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAuth } from '../context/authContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useNotificationsFeed } from '../hooks/useNotificationsFeed.ts'
import { formatDateTimeShort } from '../lib/dateFormat.ts'

export function NotificationsPage() {
  useDocumentTitle('Notifications')
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const feed = useNotificationsFeed()

  return (
    <AppShell>
      <header className="sf-surface cat-header-card sf-stack" aria-labelledby="notif-heading">
        <div className="dash-controls">
          <div className="sf-stack" style={{ gap: '4px' }}>
            <h1 id="notif-heading" className="sf-heading-display sf-row">
              <Bell size={28} color="var(--accent)" aria-hidden="true" />
              <span>Notifications</span>
            </h1>
            <p className="sf-text-muted tabular-nums">{feed.unreadCount} unread notifications</p>
          </div>
          <div className="sf-row">
            <button
              type="button"
              className="sf-btn sf-btn--secondary pf-view-btn"
              aria-pressed={!feed.unreadOnly}
              onClick={() => feed.changeFilter(false)}
            >
              All
            </button>
            <button
              type="button"
              className="sf-btn sf-btn--secondary pf-view-btn"
              aria-pressed={feed.unreadOnly}
              onClick={() => feed.changeFilter(true)}
            >
              Unread
            </button>
            <button
              type="button"
              className="sf-btn sf-btn--primary"
              disabled={feed.unreadCount === 0 || feed.markingAll}
              onClick={() => void feed.markAll()}
            >
              <CheckCheck size={16} aria-hidden="true" />
              <span>{feed.markingAll ? 'Updating...' : 'Mark all read'}</span>
            </button>
          </div>
        </div>
      </header>

      {feed.error ? (
        <StatusBanner
          variant="error"
          title="Could not load notifications"
          message={feed.error}
          actionLabel="Retry"
          onAction={feed.retry}
        />
      ) : feed.loading ? (
        <StatusBanner variant="loading" title="Loading notifications" skeletonLines={5} />
      ) : feed.items.length === 0 ? (
        <StatusBanner
          variant="empty"
          title="You are all caught up"
          message="No notifications match the active filter."
        />
      ) : (
        <section className="sf-surface res-stage-card sf-stack" aria-label="Notification list">
          <ul className="assign-file-list">
            {feed.items.map((item) => {
              const targetHref = item.actionUrl ?? (item.courseId ? `/courses/${item.courseId}` : null)
              return (
                <li
                  key={item.id}
                  className={`comms-notif-item${item.isRead ? '' : ' comms-notif-item--unread'}`}
                >
                  <div className="sf-stack" style={{ gap: '4px', flex: '1 1 260px' }}>
                    <strong>{item.title}</strong>
                    <p className="sf-text-muted">{item.body}</p>
                    <span className="sf-text-muted tabular-nums">
                      {item.courseTitle ? `${item.courseTitle} · ` : ''}
                      {formatDateTimeShort(item.createdAt, tz)}
                    </span>
                  </div>
                  <div className="sf-row">
                    {targetHref ? (
                      <Link href={targetHref} className="sf-btn sf-btn--secondary">
                        Open details
                      </Link>
                    ) : null}
                    {!item.isRead ? (
                      <button
                        type="button"
                        className="sf-btn sf-btn--ghost"
                        disabled={feed.busyId === item.id}
                        onClick={() => void feed.markRead(item.id)}
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>

          {feed.pagination && (feed.pagination.totalPages ?? 1) > 1 ? (
            <div className="sf-row" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                disabled={feed.page <= 1}
                onClick={() => feed.changePage(feed.page - 1)}
              >
                Previous page
              </button>
              <span className="sf-text-muted tabular-nums">
                Page {feed.page} of {feed.pagination.totalPages}
              </span>
              <button
                type="button"
                className="sf-btn sf-btn--secondary"
                disabled={feed.page >= (feed.pagination.totalPages ?? 1)}
                onClick={() => feed.changePage(feed.page + 1)}
              >
                Next page
              </button>
            </div>
          ) : null}
        </section>
      )}
    </AppShell>
  )
}
