import { and, asc, count, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courseModules, gradeItems, grades, users } from '../../db/schema.js'
import { requireEnrolledCourse } from '../courses/courses.service.js'
import {
  computeWeightedCourseGrade,
  formatGrade,
  getLetterGrade,
} from './grades.formatters.js'

export {
  computeWeightedCourseGrade,
  formatGrade,
  getLetterGrade,
} from './grades.formatters.js'
export { getGradesOverview } from './grades.overview.js'

export async function getCourseGradebook(
  userId: string,
  userRole: string,
  rawCourseId: number,
) {
  const { course, enrollment } = await requireEnrolledCourse(userId, rawCourseId)

  const visibilityCondition =
    userRole === 'student'
      ? and(
          eq(gradeItems.courseId, course.id),
          eq(gradeItems.isHiddenFromStudents, false),
        )
      : eq(gradeItems.courseId, course.id)

  const [[totalCountRow], rows] = await Promise.all([
    db
      .select({ total: count() })
      .from(gradeItems)
      .where(eq(gradeItems.courseId, course.id)),
    db
      .select({
        id: gradeItems.id,
        name: gradeItems.name,
        moduleId: gradeItems.moduleId,
        moodleModuleId: courseModules.moodleModuleId,
        moduleType: courseModules.moduleType,
        maxGrade: gradeItems.maxGrade,
        weight: gradeItems.weight,
        isHiddenFromStudents: gradeItems.isHiddenFromStudents,
        score: grades.score,
        feedback: grades.feedback,
        gradedAt: grades.gradedAt,
        graderName: users.fullName,
      })
      .from(gradeItems)
      .leftJoin(
        grades,
        and(eq(grades.gradeItemId, gradeItems.id), eq(grades.userId, userId)),
      )
      .leftJoin(courseModules, eq(gradeItems.moduleId, courseModules.id))
      .leftJoin(users, eq(grades.graderUserId, users.id))
      .where(visibilityCondition)
      .orderBy(asc(gradeItems.id)),
  ])

  const items = rows.map((row) => {
    const maxGrade = Number(row.maxGrade)
    const numericScore = row.score !== null ? Number(row.score) : null
    const percentage =
      numericScore !== null && maxGrade > 0
        ? Math.round((numericScore / maxGrade) * 10000) / 100
        : null

    return {
      id: row.id,
      name: row.name,
      moduleId: row.moduleId,
      moodleModuleId: row.moodleModuleId,
      moduleType: row.moduleType,
      maxGrade,
      weight: Number(row.weight),
      isHiddenFromStudents: row.isHiddenFromStudents,
      score: numericScore,
      percentage,
      formattedGrade: formatGrade(row.score),
      letterGrade: getLetterGrade(percentage),
      feedback: row.feedback,
      gradedAt: row.gradedAt ? row.gradedAt.toISOString() : null,
      graderName: row.graderName ?? null,
    }
  })

  const visibleRows = rows.filter((r) => !r.isHiddenFromStudents)
  const liveTotal = computeWeightedCourseGrade(visibleRows)
  const hasAnyItems = Number(totalCountRow?.total ?? 0) > 0
  const resolvedTotalStr = hasAnyItems ? liveTotal : (enrollment.cachedFinalGrade ?? null)
  const totalScore = resolvedTotalStr !== null ? Number(resolvedTotalStr) : null

  return {
    course: {
      id: course.id,
      moodleCourseId: course.moodleCourseId,
      code: course.code,
      title: course.title,
      shortName: course.shortName,
    },
    courseTotal: {
      score: totalScore,
      formattedGrade: formatGrade(resolvedTotalStr),
      letterGrade: getLetterGrade(totalScore),
      gradedItemsCount: visibleRows.filter((r) => r.score !== null).length,
      totalItemsCount: visibleRows.length,
    },
    items,
  }
}
