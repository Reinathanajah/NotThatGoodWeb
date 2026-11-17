import './reports.css'
import { Link } from 'wouter'
import { resolveCourseHref } from '../../lib/appRoutes.ts'
import type { GradesOverviewCourseDto } from '../../types/reports.ts'

export function GradesOverviewTable({ courses }: { courses: GradesOverviewCourseDto[] }) {
  return (
    <div className="rep-table-wrap">
      <table className="rep-table">
        <caption>Enrolled courses and current grade totals</caption>
        <thead>
          <tr>
            <th scope="col">Course</th>
            <th scope="col">Term</th>
            <th scope="col" className="rep-num">Graded items</th>
            <th scope="col" className="rep-num">Course total</th>
            <th scope="col">Grade status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const courseHref = resolveCourseHref({
              id: course.courseId,
              moodleCourseId: course.moodleCourseId,
            })
            return (
              <tr key={course.courseId}>
                <td>
                  <Link href={`${courseHref}/grades`} style={{ fontWeight: 600 }}>
                    {course.title}
                  </Link>
                  <div className="sf-text-muted">{course.code}</div>
                </td>
                <td>{course.termLabel ?? '-'}</td>
                <td className="rep-num">
                  {course.gradedItemsCount}/{course.totalItemsCount}
                </td>
                <td className="rep-num" style={{ fontWeight: 700 }}>
                  {course.formattedGrade}
                </td>
                <td>
                  <span
                    className={`rep-pill ${
                      course.finalGrade !== null ? 'rep-pill--graded' : 'rep-pill--pending'
                    }`}
                  >
                    <span className="rep-pill-dot" aria-hidden="true" />
                    <span>
                      {course.letterGrade ?? (course.finalGrade !== null ? 'Graded' : 'No grade yet')}
                    </span>
                  </span>
                </td>
                <td>
                  <div className="sf-row" style={{ gap: 'var(--space-2)' }}>
                    <Link href={`${courseHref}/grades`} className="sf-btn sf-btn--secondary">
                      Gradebook
                    </Link>
                    <Link href={courseHref} className="sf-btn sf-btn--ghost">
                      Course
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
