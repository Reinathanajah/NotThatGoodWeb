import '../../components/ui/modal.css'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { StatusBanner } from '../../components/ui/StatusBanner.tsx'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { fetchStaticPage } from '../../services/systemApi.ts'
import type { StaticPageDto } from '../../types/workspace.ts'

interface CookiesModalProps {
  open: boolean
  titleFallback: string
  onClose: () => void
}

export function CookiesModal({ open, titleFallback, onClose }: CookiesModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const [page, setPage] = useState<StaticPageDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useFocusTrap(open, dialogRef, onClose)

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    fetchStaticPage('cookies_notice', controller.signal).then(
      (data) => {
        setPage(data)
        setError(null)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load cookies notice')
      },
    )
    return () => controller.abort()
  }, [open])

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="modal-dialog sf-stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookies-dialog-title"
      >
        <div className="sf-row" style={{ justifyContent: 'space-between' }}>
          <h2 id="cookies-dialog-title" className="sf-heading-section">
            {page?.title ?? titleFallback}
          </h2>
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            onClick={onClose}
            aria-label="Close cookies notice"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {error ? (
          <StatusBanner variant="error" title="Could not load notice" message={error} />
        ) : page ? (
          <div className="sf-stack">
            <p>{page.contentMarkdown}</p>
            <p className="sf-text-muted">
              Essential cookies must remain enabled for authenticated browser sessions and language
              selection.
            </p>
          </div>
        ) : (
          <StatusBanner variant="loading" title="Loading notice" skeletonLines={2} />
        )}

        <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="sf-btn sf-btn--primary" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}
