import { useAuth } from '../../context/authContextValue.ts'
import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import type { QuizAttemptSummaryDto } from '../../types/quizzes.ts'

interface QuizAttemptsTableProps {
  attempts: QuizAttemptSummaryDto[]
  maxGrade: string
}

export function QuizAttemptsTable({ attempts, maxGrade }: QuizAttemptsTableProps) {
  const { user } = useAuth()
  const tz = user?.timezone ?? 'UTC'

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-labelledby="attempts-heading">
      <h2 id="attempts-heading" className="sf-heading-section">
        Attempt history
      </h2>
      {attempts.length === 0 ? (
        <p className="sf-text-muted">No attempts recorded yet for this quiz.</p>
      ) : (
        <div className="quiz-table-wrap">
          <table className="quiz-attempts-table tabular-nums">
            <thead>
              <tr>
                <th scope="col">Attempt</th>
                <th scope="col">Status</th>
                <th scope="col">Score</th>
                <th scope="col">Started</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>#{a.attemptNumber}</td>
                  <td>{a.status}</td>
                  <td>{a.score !== null ? `${a.score} / ${maxGrade}` : '-'}</td>
                  <td>{formatDateTimeShort(a.startedAt, tz)}</td>
                  <td>{a.submittedAt ? formatDateTimeShort(a.submittedAt, tz) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
