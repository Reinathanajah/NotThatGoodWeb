import { getAssignmentWindowState } from '../lib/assignmentTime.ts'
import type { AssignmentDetailDto } from '../types/activities.ts'

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
