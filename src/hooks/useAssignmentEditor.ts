import { useCallback, useEffect, useState } from 'react'
import type { StagedAttachment } from '../components/assignments/SubmissionFilesDropzone.tsx'
import {
  fetchAssignmentDetail,
  upsertAssignmentSubmission,
} from '../services/assignmentsApi.ts'
import type { AssignmentDetailDto } from '../types/activities.ts'
import type { StoredFileMetaDto } from '../types/files.ts'
import {
  deriveEditability,
  extractSubmissionSaveErrors,
  mapInitialAttachments,
  validateBeforeSubmit,
} from './assignmentEditorHelpers.ts'

export function useAssignmentEditor(moduleId: number) {
  const [trackedId, setTrackedId] = useState(moduleId)
  const [detail, setDetail] = useState<AssignmentDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [onlineText, setOnlineText] = useState('')
  const [files, setFiles] = useState<StagedAttachment[]>([])
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [declarationError, setDeclarationError] = useState<string | null>(null)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null)
  const [nonce, setNonce] = useState(0)

  if (trackedId !== moduleId) {
    setTrackedId(moduleId)
    setDetail(null)
    setLoading(true)
    setLoadError(null)
    setSubmitError(null)
    setDeclarationError(null)
    setFilesError(null)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchAssignmentDetail(moduleId, controller.signal).then(
      (res) => {
        if (controller.signal.aborted) return
        setDetail(res)
        setOnlineText(res.submissionStatus.onlineText ?? '')
        setFiles(mapInitialAttachments(res))
        setDeclarationAccepted(res.submissionStatus.declarationAccepted)
        setLoadError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(err instanceof Error ? err.message : 'Unable to load assignment editor')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [moduleId, nonce])

  const addFile = useCallback(
    (file: StoredFileMetaDto) => {
      if (!detail) return
      setFilesError(null)
      setFiles((prev) => {
        if (prev.some((item) => item.id === file.id)) return prev
        if (prev.length >= detail.rules.maxFiles) {
          setFilesError(`Maximum of ${detail.rules.maxFiles} files allowed.`)
          return prev
        }
        return [
          ...prev,
          { id: file.id, name: file.displayName, sizeBytes: file.sizeBytes, license: file.license },
        ]
      })
    },
    [detail],
  )

  const removeFile = useCallback((fileId: string) => {
    setFilesError(null)
    setFiles((prev) => prev.filter((item) => item.id !== fileId))
  }, [])

  const submitForm = useCallback(
    async (action: 'draft' | 'submit', onSuccess: () => void) => {
      if (!detail || saving) return
      setSubmitError(null)
      const check = validateBeforeSubmit({
        action,
        fileCount: files.length,
        onlineText,
        requireDeclaration: detail.rules.requireSubmissionStatement,
        declarationAccepted,
      })
      setFilesError(check.filesError)
      setDeclarationError(check.declarationError)
      if (check.filesError || check.declarationError) return

      setSaving(action)
      try {
        await upsertAssignmentSubmission(detail.moduleId, {
          action,
          onlineText: onlineText.trim() || null,
          fileIds: files.map((f) => f.id),
          declarationAccepted,
        })
        onSuccess()
      } catch (err: unknown) {
        const mapped = extractSubmissionSaveErrors(err)
        setDeclarationError(mapped.declarationError)
        setFilesError(mapped.filesError)
        setSubmitError(mapped.submitError)
      } finally {
        setSaving(null)
      }
    },
    [detail, saving, files, onlineText, declarationAccepted],
  )

  const state = deriveEditability(detail)

  return {
    detail,
    loading,
    loadError,
    onlineText,
    files,
    declarationAccepted,
    declarationError,
    filesError,
    submitError,
    saving,
    ...state,
    setOnlineText,
    setDeclarationAccepted: (next: boolean) => {
      setDeclarationAccepted(next)
      if (next) setDeclarationError(null)
    },
    addFile,
    removeFile,
    submitForm,
    retry: () => {
      setLoading(true)
      setLoadError(null)
      setNonce((n) => n + 1)
    },
  }
}
