import type {
  AssignmentDetailDto,
  PlagiarismStatusResponseDto,
  SubmissionCommentDto,
  UpsertSubmissionInput,
} from '../types/activities.ts'
import { apiDownloadBlob } from './apiBinary.ts'
import { apiFetch } from './apiClient.ts'
import { saveBlobToDisk } from './resourcesApi.ts'

export function fetchAssignmentDetail(
  moduleId: number,
  signal?: AbortSignal,
): Promise<AssignmentDetailDto> {
  return apiFetch<AssignmentDetailDto>(`/assignments/${moduleId}`, { signal })
}

export function upsertAssignmentSubmission(
  moduleId: number,
  input: UpsertSubmissionInput,
): Promise<AssignmentDetailDto> {
  return apiFetch<AssignmentDetailDto>(`/assignments/${moduleId}/submission`, {
    method: 'PUT',
    body: input,
  })
}

export function fetchAssignmentComments(
  moduleId: number,
  signal?: AbortSignal,
): Promise<SubmissionCommentDto[]> {
  return apiFetch<SubmissionCommentDto[]>(`/assignments/${moduleId}/comments`, { signal })
}

export function postAssignmentComment(
  moduleId: number,
  body: string,
): Promise<SubmissionCommentDto> {
  return apiFetch<SubmissionCommentDto>(`/assignments/${moduleId}/comments`, {
    method: 'POST',
    body: { body },
  })
}

export function fetchPlagiarismStatus(
  moduleId: number,
  signal?: AbortSignal,
): Promise<PlagiarismStatusResponseDto> {
  return apiFetch<PlagiarismStatusResponseDto>(`/assignments/${moduleId}/plagiarism/status`, {
    signal,
  })
}

export function triggerPlagiarismScan(moduleId: number): Promise<PlagiarismStatusResponseDto> {
  return apiFetch<PlagiarismStatusResponseDto>(`/assignments/${moduleId}/plagiarism/submit`, {
    method: 'POST',
  })
}

export async function downloadSubmissionFile(
  fileId: string,
  fallbackName: string,
): Promise<void> {
  const { blob, filename } = await apiDownloadBlob(`/files/${fileId}/download`, {
    fallbackFilename: fallbackName,
  })
  saveBlobToDisk(blob, filename)
}
