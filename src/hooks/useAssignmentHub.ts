import { useCallback, useEffect, useState } from 'react'
import {
  downloadSubmissionFile,
  fetchAssignmentComments,
  fetchAssignmentDetail,
  fetchPlagiarismStatus,
  triggerPlagiarismScan,
} from '../services/assignmentsApi.ts'
import type { AssignmentDetailDto, PlagiarismJobDto } from '../types/activities.ts'
import { useAssignmentComments } from './useAssignmentComments.ts'

function hasPendingScan(jobs: PlagiarismJobDto[]): boolean {
  return jobs.some((job) => job.status === 'pending' || job.status === 'scanning')
}

export function useAssignmentHub(moduleId: number) {
  const [trackedId, setTrackedId] = useState(moduleId)
  const [detail, setDetail] = useState<AssignmentDetailDto | null>(null)
  const [jobs, setJobs] = useState<PlagiarismJobDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const commentState = useAssignmentComments(moduleId)
  const { setComments, submitComment: runSubmitComment } = commentState

  if (trackedId !== moduleId) {
    setTrackedId(moduleId)
    setDetail(null)
    setJobs([])
    setLoading(true)
    setError(null)
    setScanError(null)
    setDownloadError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetchAssignmentDetail(moduleId, controller.signal),
      fetchAssignmentComments(moduleId, controller.signal),
      fetchPlagiarismStatus(moduleId, controller.signal),
    ]).then(
      ([assignDetail, commentList, plagStatus]) => {
        if (controller.signal.aborted) return
        setDetail(assignDetail)
        setComments(commentList)
        setJobs(
          plagStatus.jobs.length > 0 ? plagStatus.jobs : assignDetail.submissionStatus.plagiarismJobs,
        )
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load assignment')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [moduleId, nonce, setComments])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const needsPolling = hasPendingScan(jobs)
  useEffect(() => {
    if (!needsPolling || loading) return
    const controller = new AbortController()
    const timer = window.setInterval(() => {
      fetchPlagiarismStatus(moduleId, controller.signal).then(
        (res) => setJobs(res.jobs),
        () => undefined,
      )
    }, 3000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [moduleId, needsPolling, loading])

  const triggerScan = useCallback(async () => {
    if (!detail || scanning) return
    setScanning(true)
    setScanError(null)
    try {
      const res = await triggerPlagiarismScan(detail.moduleId)
      setJobs(res.jobs)
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : 'Unable to start plagiarism scan')
    } finally {
      setScanning(false)
    }
  }, [detail, scanning])

  const submitComment = useCallback(
    (body: string) =>
      runSubmitComment(body, () =>
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                submissionStatus: {
                  ...prev.submissionStatus,
                  commentCount: prev.submissionStatus.commentCount + 1,
                },
              }
            : prev,
        ),
      ),
    [runSubmitComment],
  )

  const downloadFile = useCallback(async (fileId: string, fileName: string) => {
    setDownloadingFileId(fileId)
    setDownloadError(null)
    try {
      await downloadSubmissionFile(fileId, fileName)
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloadingFileId(null)
    }
  }, [])

  return {
    detail,
    comments: commentState.comments,
    jobs,
    loading,
    error,
    nowMs,
    scanning,
    scanError,
    submittingComment: commentState.submittingComment,
    commentError: commentState.commentError,
    downloadingFileId,
    downloadError,
    triggerScan,
    submitComment,
    downloadFile,
    retry: () => {
      setLoading(true)
      setError(null)
      setNonce((n) => n + 1)
    },
  }
}
