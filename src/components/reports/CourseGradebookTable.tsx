import './reports.css'
import { Link } from 'wouter'
import { resolveModuleHref } from '../../lib/appRoutes.ts'
import type { CourseGradebookItemDto } from '../../types/reports.ts'

interface CourseGradebookTableProps {
  courseTitle: string
  courseId: number
  items: CourseGradebookItemDto[]
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}

export function CourseGradebookTable({
  courseTitle,
  courseId,
  items,
}: CourseGradebookTableProps) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <caption>{courseTitle} graded assessments</caption>
        <thead>
          <tr>
            <th scope="col">Assessment item</th>
            <th scope="col" className="rep-num">Weight</th>
            <th scope="col" className="rep-num">Max</th>
            <th scope="col" className="rep-num">Score</th>
            <th scope="col" className="rep-num">Percent</th>
            <th scope="col">Grade</th>
            <th scope="col">Feedback & grader</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const hasActivity = Boolean(item.moduleType && (item.moodleModuleId ?? item.moduleId))
            const itemHref = hasActivity
              ? resolveModuleHref({
                  id: item.moduleId ?? undefined,
                  moodleModuleId: item.moodleModuleId,
                  moduleType: item.moduleType!,
                  courseId,
                })
              : null

            return (
              <tr key={item.id}>
                <td>
                  {itemHref ? (
                    <Link href={itemHref} style={{ fontWeight: 600 }}>
                      {item.name}
                    </Link>
                  ) : (
                    <strong>{item.name}</strong>
                  )}
                  {item.moduleType ? (
                    <div className="sf-text-muted">{item.moduleType}</div>
                  ) : null}
                </td>
                <td className="rep-num">{item.weight.toFixed(2)}</td>
                <td className="rep-num">{item.maxGrade.toFixed(2)}</td>
                <td className="rep-num" style={{ fontWeight: 600 }}>
                  {item.formattedGrade}
                </td>
                <td className="rep-num">
                  {item.percentage !== null ? `${item.percentage.toFixed(1)}%` : '-'}
                </td>
                <td>
                  <span
                    className={`rep-pill ${
                      item.score !== null ? 'rep-pill--graded' : 'rep-pill--pending'
                    }`}
                  >
                    <span className="rep-pill-dot" aria-hidden="true" />
                    <span>{item.letterGrade ?? (item.score !== null ? 'Graded' : 'Pending')}</span>
                  </span>
                </td>
                <td>
                  {item.feedback ? <p>{item.feedback}</p> : <span className="sf-text-muted">No comments</span>}
                  {item.graderName || item.gradedAt ? (
                    <p className="sf-text-muted">
                      {item.graderName ?? 'Instructor'} · {formatDate(item.gradedAt)}
                    </p>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
