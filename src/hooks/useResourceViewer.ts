import { useCallback, useEffect, useState } from 'react'
import { setCourseModuleCompletion } from '../services/coursesApi.ts'
import { fetchResourceBinary, fetchResourceDetail, saveBlobToDisk } from '../services/resourcesApi.ts'
import type { ResourceDetailDto } from '../types/courses.ts'
import { useResourcePreview } from './useResourcePreview.ts'

export function useResourceViewer(moduleId: number) {
  const [trackedId, setTrackedId] = useState(moduleId)
  const [detail, setDetail] = useState<ResourceDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingComplete, setTogglingComplete] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  if (trackedId !== moduleId) {
    setTrackedId(moduleId)
    setDetail(null)
    setLoading(true)
    setError(null)
    setActionError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchResourceDetail(moduleId, controller.signal).then(
      (payload) => {
        if (controller.signal.aborted) return
        setDetail(payload)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load resource')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [moduleId, nonce])

  const preview = useResourcePreview(detail, nonce)

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
    ...preview,
    togglingComplete,
    downloading,
    actionError,
    downloadAttachment,
    toggleCompletion,
    retry: () => {
      setLoading(true)
      setError(null)
      setNonce((n) => n + 1)
    },
  }
}
