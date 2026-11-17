import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/files/filePicker.css'
import { ChevronRight } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'
import { AssignmentEditorForm } from '../components/assignments/AssignmentEditorForm.tsx'
import { FilePickerModal } from '../components/files/FilePickerModal.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAssignmentEditor } from '../hooks/useAssignmentEditor.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { resolveCourseHref } from '../lib/appRoutes.ts'

export function AssignmentEditorPage() {
  const params = useParams<{ moduleId?: string }>()
  const [, setLocation] = useLocation()
  const parsedId = Number(params.moduleId)
  const moduleId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0

  const editor = useAssignmentEditor(moduleId)
  const [pickerOpen, setPickerOpen] = useState(false)
  const detail = editor.detail
  useDocumentTitle(detail ? `Edit submission: ${detail.title}` : 'Edit submission')

  function goToHub() {
    if (detail) setLocation(`/assignments/${detail.moduleId}`)
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void editor.submitForm('submit', goToHub)
  }

  const lockMessage = editor.isGraded
    ? 'This submission is already graded and cannot be modified.'
    : editor.atAttemptCap
      ? 'You have reached the maximum number of attempts for this assignment.'
      : editor.windowState === 'upcoming'
        ? 'This assignment is not open for submissions yet.'
        : 'The submission cut-off time has passed.'

  return (
    <AppShell>
      {moduleId === 0 ? (
        <StatusBanner
          variant="error"
          title="Invalid assignment identifier"
          message="Open an assignment from your course syllabus before editing submissions."
          actionLabel="Return to dashboard"
          onAction={() => setLocation('/')}
        />
      ) : editor.loadError ? (
        <StatusBanner
          variant="error"
          title="Could not open submission editor"
          message={editor.loadError}
          actionLabel="Retry"
          onAction={editor.retry}
        />
      ) : editor.loading || !detail ? (
        <StatusBanner variant="loading" title="Loading submission workbench" skeletonLines={5} />
      ) : (
        <>
          <header className="sf-surface cat-header-card sf-stack" aria-labelledby="editor-title">
            <nav aria-label="Editor breadcrumb">
              <ol className="cat-breadcrumb-list">
                <li className="cat-breadcrumb-item">
                  <Link href={resolveCourseHref(detail.course)}>
                    {detail.course.code} · {detail.course.title}
                  </Link>
                  <ChevronRight size={16} aria-hidden="true" />
                </li>
                <li className="cat-breadcrumb-item">
                  <Link href={`/assignments/${detail.moduleId}`}>{detail.title}</Link>
                  <ChevronRight size={16} aria-hidden="true" />
                </li>
                <li className="cat-breadcrumb-item">
                  <span aria-current="page" style={{ fontWeight: 600 }}>
                    Edit submission
                  </span>
                </li>
              </ol>
            </nav>
            <h1 id="editor-title" className="sf-heading-display">
              {detail.title}
            </h1>
          </header>

          {!editor.isEditable ? (
            <StatusBanner
              variant="info"
              title="Submissions are locked"
              message={lockMessage}
              actionLabel="Back to assignment"
              onAction={goToHub}
            />
          ) : null}

          <AssignmentEditorForm
            detail={detail}
            onlineText={editor.onlineText}
            files={editor.files}
            declarationAccepted={editor.declarationAccepted}
            declarationError={editor.declarationError}
            filesError={editor.filesError}
            submitError={editor.submitError}
            saving={editor.saving}
            isEditable={editor.isEditable}
            isSubmitted={editor.isSubmitted}
            onOnlineTextChange={editor.setOnlineText}
            onDeclarationChange={editor.setDeclarationAccepted}
            onAddFile={editor.addFile}
            onRemoveFile={editor.removeFile}
            onOpenPicker={() => setPickerOpen(true)}
            onSaveDraft={() => void editor.submitForm('draft', goToHub)}
            onSubmitFinal={handleFormSubmit}
          />

          <FilePickerModal
            open={pickerOpen}
            uploadTarget="submission_draft"
            maxFileSizeBytes={detail.rules.maxFileSizeBytes}
            onSelect={editor.addFile}
            onClose={() => setPickerOpen(false)}
          />
        </>
      )}
    </AppShell>
  )
}
