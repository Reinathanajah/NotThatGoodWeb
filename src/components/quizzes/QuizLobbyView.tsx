import { Calendar, ChevronRight, ClipboardCheck, Clock, Play } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { resolveCategoryHref, resolveCourseHref } from '../../lib/appRoutes.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatDurationMinutes, hasActiveInProgressAttempt } from '../../lib/quizTimer.ts'
import type { QuizDetailDto } from '../../types/quizzes.ts'
import { ActivityNavigationRail } from '../courses/ActivityNavigationRail.tsx'
import { SafeHtmlBlock } from '../ui/SafeHtmlBlock.tsx'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { QuizAttemptsTable } from './QuizAttemptsTable.tsx'

interface QuizLobbyViewProps {
  detail: QuizDetailDto
  starting: boolean
  actionError: string | null
  onStartAttempt: () => void
}

const WINDOW_COPY = {
  not_opened: { label: 'Not yet open', tone: 'assign-state-chip--warn' },
  open: { label: 'Open now', tone: 'assign-state-chip--done' },
  closed: { label: 'Closed', tone: 'assign-state-chip--error' },
} as const

export function QuizLobbyView({
  detail,
  starting,
  actionError,
  onStartAttempt,
}: QuizLobbyViewProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'
  const win = WINDOW_COPY[detail.windowStatus]
  const resuming = hasActiveInProgressAttempt(detail)

  return (
    <>
      <header className="sf-surface cat-header-card sf-stack" aria-labelledby="quiz-title">
        <nav aria-label="Quiz breadcrumb">
          <ol className="cat-breadcrumb-list">
            {detail.breadcrumbs.map((crumb) => (
              <Fragment key={crumb.id}>
                <li className="cat-breadcrumb-item">
                  <Link href={resolveCategoryHref(crumb)}>{crumb.name}</Link>
                  <ChevronRight size={16} aria-hidden="true" />
                </li>
              </Fragment>
            ))}
            <li className="cat-breadcrumb-item">
              <Link href={resolveCourseHref(detail.course)}>
                {detail.course.code} · {detail.course.title}
              </Link>
              <ChevronRight size={16} aria-hidden="true" />
            </li>
            <li className="cat-breadcrumb-item">
              <span aria-current="page" style={{ fontWeight: 600 }}>
                {detail.title}
              </span>
            </li>
          </ol>
        </nav>

        <div className="dash-controls">
          <div className="sf-stack" style={{ gap: 'var(--space-1)', flex: '1 1 320px' }}>
            <h1 id="quiz-title" className="sf-heading-display">
              {detail.title}
            </h1>
            <p className="sf-text-muted tabular-nums">
              {detail.subsectionLabel ? `${detail.subsectionLabel} · ` : ''}
              {detail.questionCount} {detail.questionCount === 1 ? 'question' : 'questions'} ·{' '}
              Time limit: {formatDurationMinutes(detail.timeLimitSeconds)} · Max grade{' '}
              {Number(detail.maxGrade)} · {detail.attempts.length} / {detail.maxAttempts} attempts used
            </p>
          </div>

          <span className={`assign-state-chip ${win.tone}`}>
            <ClipboardCheck size={15} aria-hidden="true" />
            <span>{win.label}</span>
          </span>
        </div>

        <div className="assign-dates-bar tabular-nums">
          <span className="assign-date-item">
            <Calendar size={16} color="var(--accent)" aria-hidden="true" />
            <strong>Opens:</strong> {formatDateTimeShort(detail.opensAt, tz)}
          </span>
          <span className="assign-date-item">
            <Clock size={16} color="var(--accent)" aria-hidden="true" />
            <strong>Closes:</strong> {formatDateTimeShort(detail.closedAt, tz)}
          </span>
        </div>

        {detail.descriptionHtml ? <SafeHtmlBlock html={detail.descriptionHtml} /> : null}

        {actionError ? (
          <StatusBanner variant="error" title="Could not launch attempt" message={actionError} />
        ) : null}

        <div className="sf-row">
          {detail.canStartAttempt ? (
            <button
              type="button"
              className="sf-btn sf-btn--primary"
              disabled={starting}
              onClick={onStartAttempt}
            >
              <Play size={16} aria-hidden="true" />
              <span>
                {starting
                  ? 'Opening attempt...'
                  : resuming
                    ? 'Continue last attempt'
                    : 'Start attempt'}
              </span>
            </button>
          ) : (
            <p className="sf-text-muted">
              {detail.windowStatus === 'not_opened'
                ? 'Attempt unavailable until the quiz opens.'
                : detail.windowStatus === 'closed'
                  ? 'This quiz window is closed and no longer accepts attempts.'
                  : 'All permitted attempts have been completed.'}
            </p>
          )}
        </div>
      </header>

      <QuizAttemptsTable attempts={detail.attempts} maxGrade={detail.maxGrade} />

      <ActivityNavigationRail course={detail.course} navigation={detail.navigation} />
    </>
  )
}
