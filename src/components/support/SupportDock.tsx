import './supportDock.css'
import { ArrowUp, MessageSquare, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/authContextValue.ts'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { fetchSupportStatus } from '../../services/systemApi.ts'
import type { SupportStatusDto } from '../../types/workspace.ts'
import { SupportTicketForm } from './SupportTicketForm.tsx'

export function SupportDock() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [status, setStatus] = useState<SupportStatusDto | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const drawerRef = useRef<HTMLElement | null>(null)

  useFocusTrap(open, drawerRef, () => setOpen(false))

  useEffect(() => {
    const controller = new AbortController()
    fetchSupportStatus(controller.signal).then(setStatus, () => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 360)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {open ? (
        <section
          ref={drawerRef}
          className="support-drawer sf-stack"
          role="dialog"
          aria-modal="true"
          aria-label="SilverFour support drawer"
        >
          <div className="sf-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h2 className="sf-heading-section" style={{ fontSize: 'var(--text-lg)' }}>
                SilverFour helpdesk
              </h2>
              <p className="sf-text-muted">
                Chat: {status?.liveChat.statusLabel ?? 'Offline'} ·{' '}
                {status?.liveChat.serviceHours ?? 'Mon-Fri 08:00-16:00'}
              </p>
            </div>
            <button
              type="button"
              className="sf-btn sf-btn--ghost"
              aria-label="Close helpdesk drawer"
              onClick={() => {
                setOpen(false)
                triggerRef.current?.focus()
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <p className="sf-text-muted">
            {status?.liveChat.offlineMessage ??
              'Submit a support ticket below or email support@silverfour.edu.'}
          </p>

          <SupportTicketForm defaultEmail={user?.email ?? ''} requireEmail={!user} />
        </section>
      ) : null}

      <div className="support-dock">
        {showTop ? (
          <button
            type="button"
            className="sf-btn sf-btn--secondary"
            aria-label="Scroll back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        ) : null}

        <button
          ref={triggerRef}
          type="button"
          className="sf-btn sf-btn--primary"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <MessageSquare size={18} aria-hidden="true" />
          <span>Support ({status?.liveChat.statusLabel ?? 'Offline'})</span>
        </button>
      </div>
    </>
  )
}
