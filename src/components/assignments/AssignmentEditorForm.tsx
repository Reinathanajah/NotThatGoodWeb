import type { FormEvent } from 'react'
import { Link } from 'wouter'
import type { AssignmentDetailDto } from '../../types/activities.ts'
import type { StoredFileMetaDto } from '../../types/files.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { type StagedAttachment, SubmissionFilesDropzone } from './SubmissionFilesDropzone.tsx'

interface AssignmentEditorFormProps {
  detail: AssignmentDetailDto
  onlineText: string
  files: StagedAttachment[]
  declarationAccepted: boolean
  declarationError: string | null
  filesError: string | null
  submitError: string | null
  saving: 'draft' | 'submit' | null
  isEditable: boolean
  isSubmitted: boolean
  onOnlineTextChange: (val: string) => void
  onDeclarationChange: (val: boolean) => void
  onAddFile: (file: StoredFileMetaDto) => void
  onRemoveFile: (fileId: string) => void
  onOpenPicker: () => void
  onSaveDraft: () => void
  onSubmitFinal: (e: FormEvent<HTMLFormElement>) => void
}

export function AssignmentEditorForm({
  detail,
  onlineText,
  files,
  declarationAccepted,
  declarationError,
  filesError,
  submitError,
  saving,
  isEditable,
  isSubmitted,
  onOnlineTextChange,
  onDeclarationChange,
  onAddFile,
  onRemoveFile,
  onOpenPicker,
  onSaveDraft,
  onSubmitFinal,
}: AssignmentEditorFormProps) {
  return (
    <form className="sf-surface res-stage-card sf-stack" onSubmit={onSubmitFinal}>
      {submitError ? (
        <StatusBanner variant="error" title="Could not save submission" message={submitError} />
      ) : null}

      <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        <label htmlFor="assign-online-text" className="sf-text-muted" style={{ fontWeight: 600 }}>
          Online text response (optional when files are attached)
        </label>
        <textarea
          id="assign-online-text"
          className="assign-comment-textarea"
          value={onlineText}
          maxLength={50000}
          disabled={!isEditable || saving !== null}
          placeholder="Write notes, derivation summary, or links to accompany your files"
          onChange={(e) => onOnlineTextChange(e.target.value)}
        />
      </div>

      <SubmissionFilesDropzone
        files={files}
        maxFiles={detail.rules.maxFiles}
        maxFileSizeBytes={detail.rules.maxFileSizeBytes}
        disabled={!isEditable || saving !== null}
        fieldError={filesError}
        onAddFile={onAddFile}
        onRemoveFile={onRemoveFile}
        onOpenPicker={onOpenPicker}
      />

      {detail.rules.requireSubmissionStatement ? (
        <div className="sf-stack" style={{ gap: 'var(--space-2)' }}>
          <label className="fp-declaration-box">
            <input
              type="checkbox"
              checked={declarationAccepted}
              disabled={!isEditable || saving !== null}
              onChange={(e) => onDeclarationChange(e.target.checked)}
            />
            <span className="sf-text-muted" style={{ whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
              {detail.rules.submissionStatementText ??
                'I confirm this submission is my own original work and follows academic integrity guidelines.'}
            </span>
          </label>
          {declarationError ? (
            <p className="foundation-field-error" role="alert">
              ! Required: {declarationError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="sf-row" style={{ justifyContent: 'space-between' }}>
        <Link href={`/assignments/${detail.moduleId}`} className="sf-btn sf-btn--ghost">
          Cancel
        </Link>
        <div className="sf-row">
          {!isSubmitted ? (
            <button
              type="button"
              className="sf-btn sf-btn--secondary"
              disabled={!isEditable || saving !== null}
              onClick={onSaveDraft}
            >
              {saving === 'draft' ? 'Saving draft...' : 'Save draft'}
            </button>
          ) : null}
          <button
            type="submit"
            className="sf-btn sf-btn--primary"
            disabled={!isEditable || saving !== null}
          >
            {saving === 'submit' ? 'Submitting...' : 'Submit for grading'}
          </button>
        </div>
      </div>
    </form>
  )
}
