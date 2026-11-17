import { ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'
import { isSafeHttpUrl } from '../../lib/formatBytes.ts'
import { uploadFileMultipart } from '../../services/filesApi.ts'
import type { StoredFileMetaDto, WikimediaResultDto } from '../../types/files.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface FilePickerWikimediaTabProps {
  results: WikimediaResultDto[]
  query: string
  onQueryChange: (q: string) => void
  uploadTarget: 'private' | 'submission_draft'
  parentFolderId?: string
  onAttached: (file: StoredFileMetaDto) => void
}

export function FilePickerWikimediaTab({
  results,
  query,
  onQueryChange,
  uploadTarget,
  parentFolderId,
  onAttached,
}: FilePickerWikimediaTabProps) {
  const [attachingTitle, setAttachingTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAttach(item: WikimediaResultDto) {
    setAttachingTitle(item.title)
    setError(null)
    try {
      const content = [
        `Wikimedia Commons Reference: ${item.title}`,
        `Source URL: ${item.url}`,
        `MIME Type: ${item.mimeType}`,
        `Author: ${item.author}`,
        `License: ${item.license}`,
      ].join('\n')
      const baseName = item.title.replace(/\.[^.]+$/, '')
      const res = await uploadFileMultipart({
        file: new Blob([content], { type: 'text/plain' }),
        filename: `${baseName}-attribution.txt`,
        saveAs: `${baseName}-attribution.txt`,
        author: item.author,
        license: item.license,
        target: uploadTarget,
        parentFolderId,
      })
      onAttached(res.file)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to attach Wikimedia reference')
    } finally {
      setAttachingTitle(null)
    }
  }

  return (
    <div className="sf-stack" style={{ gap: 'var(--space-3)' }}>
      <div className="foundation-field">
        <label htmlFor="fp-wikimedia-search">Search Wikimedia Commons</label>
        <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
          <Search size={17} color="var(--text-secondary)" aria-hidden="true" />
          <input
            id="fp-wikimedia-search"
            type="search"
            style={{ flex: '1 1 200px' }}
            placeholder="Filter by diagram title (e.g. OSI, regression)"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      </div>

      {error ? <StatusBanner variant="error" title="Import failed" message={error} /> : null}

      {results.length === 0 ? (
        <p className="sf-text-muted">No matching Wikimedia Commons entries found.</p>
      ) : (
        <ul className="assign-file-list">
          {results.map((item) => {
            const safeUrl = isSafeHttpUrl(item.url)
            return (
              <li key={item.title} className="assign-file-row">
                <div className="sf-stack" style={{ gap: '4px', flex: '1 1 220px' }}>
                  <strong>{item.title}</strong>
                  <span className="sf-text-muted">
                    {item.author} · {item.license} · {item.mimeType}
                  </span>
                  {safeUrl ? (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="sf-row"
                      style={{ gap: '4px', fontSize: 'var(--text-sm)' }}
                    >
                      <span>View Commons record</span>
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="sf-btn sf-btn--secondary"
                  disabled={attachingTitle === item.title}
                  onClick={() => void handleAttach(item)}
                >
                  {attachingTitle === item.title ? 'Attaching...' : 'Attach reference'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
