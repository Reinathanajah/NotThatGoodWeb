import { useCallback, useEffect, useState } from 'react'
import { setCourseModuleCompletion } from '../services/coursesApi.ts'
import {
  fetchResourceBinary,
  fetchResourceDetail,
  saveBlobToDisk,
} from '../services/resourcesApi.ts'
import type { ResourceDetailDto } from '../types/courses.ts'

function canInlinePreview(mimeType: string) {
  return (
    mimeType.includes('pdf') ||
    mimeType.startsWith('text/html') ||
    mimeType.startsWith('image/')
  )
}

export function useResourceViewer(moduleId: number) {
  const [trackedId, setTrackedId] = useState(moduleId)
  const [detail, setDetail] = useState<ResourceDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [togglingComplete, setTogglingComplete] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  if (trackedId !== moduleId) {
    setTrackedId(moduleId)
    setDetail(null)
    setLoading(true)
    setError(null)
    setPreviewLoading(false)
    setPreviewError(null)
    setPreviewUrl(null)
    setHtmlContent(null)
    setActionError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    let createdUrl: string | null = null

    fetchResourceDetail(moduleId, controller.signal).then(
      (payload) => {
        if (controller.signal.aborted) return
        setDetail(payload)
        setError(null)
        setLoading(false)

        const file = payload.file
        if (!file || !canInlinePreview(file.mimeType)) return
        setPreviewLoading(true)

        fetchResourceBinary(payload.moduleId, 'inline', file.originalName, controller.signal).then(
          async ({ blob, mimeType }) => {
            if (controller.signal.aborted) return
            if (mimeType.startsWith('text/html')) {
              setHtmlContent(await blob.text())
            } else {
              createdUrl = URL.createObjectURL(blob)
              setPreviewUrl(createdUrl)
            }
            setPreviewLoading(false)
          },
          (err: unknown) => {
            if (controller.signal.aborted) return
            setPreviewError(err instanceof Error ? err.message : 'Unable to render resource preview')
            setPreviewLoading(false)
          },
        )
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load resource')
        setLoading(false)
      },
    )

    return () => {
      controller.abort()
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [moduleId, nonce])

  const downloadAttachment = useCallback(async () => {
    if (!detail?.file || downloading) return
    setDownloading(true)
    setActionError(null)
    try {
      const { blob, filename } = await fetchResourceBinary(
        detail.moduleId,
        'attachment',
        detail.file.originalName,
      )
      saveBlobToDisk(blob, filename)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloading(false)
    }
  }, [detail, downloading])

  const toggleCompletion = useCallback(
    async (nextCompleted: boolean) => {
      if (!detail || togglingComplete) return
      setTogglingComplete(true)
      setActionError(null)
      try {
        const res = await setCourseModuleCompletion(detail.course.id, detail.moduleId, nextCompleted)
        setDetail((prev) =>
          prev ? { ...prev, isCompleted: res.isCompleted, completedAt: res.completedAt } : prev,
        )
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : 'Unable to update completion status')
      } finally {
        setTogglingComplete(false)
      }
    },
    [detail, togglingComplete],
  )

  return {
    detail,
    loading,
    error,
    previewLoading,
    previewError,
    previewUrl,
    htmlContent,
    togglingComplete,
    downloading,
    actionError,
    downloadAttachment,
    toggleCompletion,
    retry: () => {
      setLoading(true)
      setError(null)
      setPreviewLoading(false)
      setPreviewError(null)
      setPreviewUrl(null)
      setHtmlContent(null)
      setNonce((n) => n + 1)
    },
  }
}
