import { useCallback, useState } from 'react'
import { postAssignmentComment } from '../services/assignmentsApi.ts'
import type { SubmissionCommentDto } from '../types/activities.ts'

export function useAssignmentComments(moduleId: number) {
  const [trackedId, setTrackedId] = useState(moduleId)
  const [comments, setComments] = useState<SubmissionCommentDto[]>([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  if (trackedId !== moduleId) {
    setTrackedId(moduleId)
    setComments([])
    setCommentError(null)
  }

  const submitComment = useCallback(
    async (body: string, onPosted?: () => void): Promise<boolean> => {
      if (moduleId <= 0 || submittingComment) return false
      setSubmittingComment(true)
      setCommentError(null)
      try {
        const created = await postAssignmentComment(moduleId, body)
        setComments((prev) => [...prev, created])
        onPosted?.()
        return true
      } catch (err: unknown) {
        setCommentError(err instanceof Error ? err.message : 'Could not post comment')
        return false
      } finally {
        setSubmittingComment(false)
      }
    },
    [moduleId, submittingComment],
  )

  return { comments, setComments, submittingComment, commentError, submitComment }
}
