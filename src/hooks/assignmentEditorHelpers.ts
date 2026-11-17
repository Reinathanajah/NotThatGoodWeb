import { getAssignmentWindowState } from '../lib/assignmentTime.ts'
import { ApiClientError } from '../services/apiClient.ts'
import type { StagedAttachment } from '../components/assignments/SubmissionFilesDropzone.tsx'
import type { AssignmentDetailDto } from '../types/activities.ts'

export function mapInitialAttachments(res: AssignmentDetailDto): StagedAttachment[] {
  return res.submissionStatus.files.map((f) => ({
    id: f.id,
    name: f.displayName,
    sizeBytes: f.sizeBytes,
    license: f.license,
  }))
}

export function extractSubmissionSaveErrors(err: unknown) {
  if (err instanceof ApiClientError) {
    return {
      declarationError: err.getFieldError('declarationAccepted'),
      filesError: err.getFieldError('fileIds'),
      submitError: err.message,
    }
  }
  return {
    declarationError: null,
    filesError: null,
    submitError: err instanceof Error ? err.message : 'Unable to save submission',
  }
}

export function deriveEditability(detail: AssignmentDetailDto | null) {
  const windowState = detail
    ? getAssignmentWindowState(detail.opensAt, detail.dueAt, detail.cutoffAt, Date.now())
    : ('open' as const)
  const isGraded = detail?.submissionStatus.gradingStatus === 'graded'
  const isSubmitted = detail?.submissionStatus.status === 'submitted'
  const atAttemptCap = detail
    ? isSubmitted && detail.submissionStatus.attemptNumber >= detail.rules.maxAttempts
    : false
  const isEditable = Boolean(
    detail && !isGraded && !atAttemptCap && windowState !== 'upcoming' && windowState !== 'closed',
  )
  return { windowState, isGraded, isSubmitted, atAttemptCap, isEditable }
}

export function validateBeforeSubmit(input: {
  action: 'draft' | 'submit'
  fileCount: number
  onlineText: string
  requireDeclaration: boolean
  declarationAccepted: boolean
}): { filesError: string | null; declarationError: string | null } {
  if (input.action !== 'submit') {
    return { filesError: null, declarationError: null }
  }
  const hasContent = input.fileCount > 0 || input.onlineText.trim().length > 0
  return {
    filesError: hasContent ? null : 'Attach at least one file or enter online text before submitting.',
    declarationError:
      input.requireDeclaration && !input.declarationAccepted
        ? 'Accept the academic integrity statement to submit.'
        : null,
  }
}
