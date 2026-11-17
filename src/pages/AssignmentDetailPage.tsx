import '../components/categories/categories.css'
import '../components/courses/courseDetail.css'
import '../components/assignments/assignments.css'
import { useLocation, useParams } from 'wouter'
import { AssignmentHeaderCard } from '../components/assignments/AssignmentHeaderCard.tsx'
import { AssignmentStatusCard } from '../components/assignments/AssignmentStatusCard.tsx'
import { PlagiarismPanel } from '../components/assignments/PlagiarismPanel.tsx'
import { SubmissionCommentsPanel } from '../components/assignments/SubmissionCommentsPanel.tsx'
import { ActivityNavigationRail } from '../components/courses/ActivityNavigationRail.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAssignmentHub } from '../hooks/useAssignmentHub.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export function AssignmentDetailPage() {
  const params = useParams<{ moduleId?: string }>()
  const [, setLocation] = useLocation()
  const parsedId = Number(params.moduleId)
  const moduleId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0

  const hub = useAssignmentHub(moduleId)
  const detail = hub.detail
  useDocumentTitle(detail ? detail.title : 'Assignment module')

  return (
    <AppShell>
      {moduleId === 0 ? (
        <StatusBanner
          variant="error"
          title="Invalid assignment identifier"
          message="Open a course from your dashboard or directory to access assignment modules."
          actionLabel="Return to dashboard"
          onAction={() => setLocation('/')}
        />
      ) : hub.error ? (
        <StatusBanner
          variant="error"
          title="Could not load assignment"
          message={hub.error}
          actionLabel="Retry assignment"
          onAction={hub.retry}
        />
      ) : hub.loading || !detail ? (
        <StatusBanner variant="loading" title="Loading assignment hub" skeletonLines={6} />
      ) : (
        <>
          <AssignmentHeaderCard detail={detail} nowMs={hub.nowMs} />

          <AssignmentStatusCard
            detail={detail}
            nowMs={hub.nowMs}
            downloadingFileId={hub.downloadingFileId}
            downloadError={hub.downloadError}
            onDownloadFile={(fileId, fileName) => void hub.downloadFile(fileId, fileName)}
          />

          <PlagiarismPanel
            provider={detail.rules.plagiarismProvider}
            files={detail.submissionStatus.files}
            jobs={hub.jobs}
            scanning={hub.scanning}
            scanError={hub.scanError}
            onRunScan={() => void hub.triggerScan()}
          />

          <SubmissionCommentsPanel
            comments={hub.comments}
            submitting={hub.submittingComment}
            commentError={hub.commentError}
            onSubmitComment={hub.submitComment}
          />

          <ActivityNavigationRail course={detail.course} navigation={detail.navigation} />
        </>
      )}
    </AppShell>
  )
}
