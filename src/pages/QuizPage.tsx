import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/files/filePicker.css'
import '../components/quizzes/quizzes.css'
import { useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import { QuizLobbyView } from '../components/quizzes/QuizLobbyView.tsx'
import { QuizReviewView } from '../components/quizzes/QuizReviewView.tsx'
import { QuizRunnerView } from '../components/quizzes/QuizRunnerView.tsx'
import { QuizSubmitModal } from '../components/quizzes/QuizSubmitModal.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { useQuizEngine } from '../hooks/useQuizEngine.ts'

export function QuizPage() {
  const params = useParams<{ moduleId?: string }>()
  const [, setLocation] = useLocation()
  const parsedId = Number(params.moduleId)
  const moduleId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0

  const engine = useQuizEngine(moduleId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const detail = engine.detail
  useDocumentTitle(detail ? detail.title : 'Quiz module')

  const totalQuestions = engine.session?.questions.length ?? 0
  const answeredCount = engine.session
    ? engine.session.questions.filter((q) => engine.answers[q.id] !== undefined).length
    : 0

  return (
    <AppShell>
      {moduleId === 0 ? (
        <StatusBanner
          variant="error"
          title="Invalid quiz identifier"
          message="Open a quiz module from your course syllabus."
          actionLabel="Return to dashboard"
          onAction={() => setLocation('/')}
        />
      ) : engine.error ? (
        <StatusBanner
          variant="error"
          title="Could not load quiz"
          message={engine.error}
          actionLabel="Retry quiz"
          onAction={engine.retry}
        />
      ) : engine.loading || !detail ? (
        <StatusBanner variant="loading" title="Loading timed quiz" skeletonLines={5} />
      ) : engine.session && engine.reviewResult ? (
        <QuizReviewView
          quizTitle={detail.title}
          session={engine.session}
          result={engine.reviewResult}
          onBackToSummary={engine.exitToLobby}
        />
      ) : engine.session ? (
        <>
          <QuizRunnerView
            quizTitle={detail.title}
            session={engine.session}
            answers={engine.answers}
            saveState={engine.saveState}
            secondsLeft={engine.secondsLeft}
            submitting={engine.submitting}
            actionError={engine.actionError}
            onSelectOption={engine.selectOption}
            onRetrySave={engine.retrySave}
            onOpenSubmitModal={() => setConfirmOpen(true)}
          />
          <QuizSubmitModal
            open={confirmOpen}
            answeredCount={answeredCount}
            totalCount={totalQuestions}
            submitting={engine.submitting}
            onConfirmSubmit={() => {
              setConfirmOpen(false)
              void engine.submitCurrent()
            }}
            onClose={() => setConfirmOpen(false)}
          />
        </>
      ) : (
        <QuizLobbyView
          detail={detail}
          starting={engine.starting}
          actionError={engine.actionError}
          onStartAttempt={() => void engine.beginAttempt()}
        />
      )}
    </AppShell>
  )
}
