import './reports.css'
import { Link } from 'wouter'
import { resolveCourseHref } from '../../lib/appRoutes.ts'
import type { CourseProgressRow, QuizTagRow } from '../../lib/reportRows.ts'

export function AnalyticsProgressTable({ rows }: { rows: CourseProgressRow[] }) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <caption>Detailed course progress metrics</caption>
        <thead>
          <tr>
            <th scope="col">Course</th>
            <th scope="col" className="rep-num">Completed</th>
            <th scope="col" className="rep-num">Rate</th>
            <th scope="col" className="rep-num">Submissions</th>
            <th scope="col" className="rep-num">Quiz attempts</th>
            <th scope="col" className="rep-num">Quiz avg</th>
            <th scope="col" className="rep-num">Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = resolveCourseHref({
              id: row.courseId,
              moodleCourseId: row.moodleCourseId,
            })
            return (
              <tr key={row.courseId}>
                <td>
                  <Link href={href} style={{ fontWeight: 600 }}>
                    {row.courseTitle}
                  </Link>
                  <div className="sf-text-muted">{row.courseCode}</div>
                </td>
                <td className="rep-num">
                  {row.completedModules}/{row.totalTrackableModules}
                </td>
                <td className="rep-num">
                  {row.completionRatePercent !== null ? `${row.completionRatePercent.toFixed(1)}%` : '-'}
                </td>
                <td className="rep-num">{row.submissionsCount}</td>
                <td className="rep-num">{row.quizAttemptsCount}</td>
                <td className="rep-num">
                  {row.quizAverageScore !== null ? `${row.quizAverageScore.toFixed(1)}%` : '-'}
                </td>
                <td className="rep-num">
                  <Link href={`${href}/grades`}>{row.finalGrade ?? '-'}</Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function AnalyticsQuizTagsTable({ rows }: { rows: QuizTagRow[] }) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <caption>Quiz performance grouped by question topic tag</caption>
        <thead>
          <tr>
            <th scope="col">Topic tag</th>
            <th scope="col" className="rep-num">Quizzes</th>
            <th scope="col" className="rep-num">Questions</th>
            <th scope="col" className="rep-num">Attempted</th>
            <th scope="col" className="rep-num">Correct</th>
            <th scope="col" className="rep-num">Accuracy</th>
            <th scope="col" className="rep-num">Avg duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.tag}>
              <td>
                <strong>{row.tag}</strong>
              </td>
              <td className="rep-num">{row.quizzesCount}</td>
              <td className="rep-num">{row.questionsCount}</td>
              <td className="rep-num">{row.attemptedQuestionsCount}</td>
              <td className="rep-num">{row.correctCount}</td>
              <td className="rep-num">
                {row.accuracyPercent !== null ? `${row.accuracyPercent.toFixed(1)}%` : '-'}
              </td>
              <td className="rep-num">
                {row.avgDurationSeconds !== null ? `${row.avgDurationSeconds}s` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
