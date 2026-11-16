import './widgets.css'
import { X } from 'lucide-react'
import { useRef } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { LearnerScriptQuickPanel } from './LearnerScriptQuickPanel.tsx'
import { MiniCalendarWidget } from './MiniCalendarWidget.tsx'
import { TimezoneClockPanel } from './TimezoneClockPanel.tsx'

interface WorkspaceUtilityDrawerProps {
  open: boolean
  onClose: () => void
}

export function WorkspaceUtilityDrawer({ open, onClose }: WorkspaceUtilityDrawerProps) {
  const panelRef = useRef<HTMLElement | null>(null)

  useFocusTrap(open, panelRef, onClose)

  if (!open) return null

  return (
    <div
      className="utility-drawer-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <aside
        ref={panelRef}
        className="utility-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Workspace tools drawer"
      >
        <div className="sf-row" style={{ justifyContent: 'space-between' }}>
          <strong>Workspace tools</strong>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            aria-label="Close workspace tools drawer"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <TimezoneClockPanel />
        <hr className="sf-divider" />
        <MiniCalendarWidget onNavigate={onClose} />
        <hr className="sf-divider" />
        <LearnerScriptQuickPanel onNavigate={onClose} />
      </aside>
    </div>
  )
}
