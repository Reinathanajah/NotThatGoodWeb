import { useEffect, useState } from 'react'
import { fetchResourceBinary } from '../services/resourcesApi.ts'
import type { ResourceDetailDto } from '../types/courses.ts'

export function canInlinePreview(mimeType: string): boolean {
  return (
    mimeType.includes('pdf') ||
    mimeType.startsWith('text/html') ||
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/')
  )
}

export function useResourcePreview(detail: ResourceDetailDto | null, nonce: number) {
  const file = detail?.file
  const canPreview = Boolean(file && canInlinePreview(file.mimeType))
  const activeKey = detail && file && canPreview ? `${detail.moduleId}:${file.id}:${nonce}` : ''

  const [result, setResult] = useState<{
    key: string
    previewUrl: string | null
    htmlContent: string | null
    previewError: string | null
  }>({ key: '', previewUrl: null, htmlContent: null, previewError: null })

  useEffect(() => {
    if (!detail || !file || !canPreview) return
    const controller = new AbortController()
    let createdUrl: string | null = null

    fetchResourceBinary(detail.moduleId, 'inline', file.originalName, controller.signal).then(
      async ({ blob, mimeType }) => {
        if (controller.signal.aborted) return
        if (mimeType.startsWith('text/html')) {
          setResult({ key: activeKey, previewUrl: null, htmlContent: await blob.text(), previewError: null })
          return
        }
        createdUrl = URL.createObjectURL(blob)
        setResult({ key: activeKey, previewUrl: createdUrl, htmlContent: null, previewError: null })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setResult({
          key: activeKey,
          previewUrl: null,
          htmlContent: null,
          previewError: err instanceof Error ? err.message : 'Unable to render resource preview',
        })
      },
    )

    return () => {
      controller.abort()
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [activeKey, canPreview, detail, file])

  const ready = activeKey !== '' && result.key === activeKey
  return {
    previewLoading: canPreview && !ready,
    previewUrl: ready ? result.previewUrl : null,
    htmlContent: ready ? result.htmlContent : null,
    previewError: ready ? result.previewError : null,
  }
}
