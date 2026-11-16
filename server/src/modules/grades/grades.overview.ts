import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  academicTerms,
  courses,
  enrollments,
  gradeItems,
  grades,
} from '../../db/schema.js'
import {
  computeWeightedCourseGrade,
  formatGrade,
  getLetterGrade,
} from './grades.formatters.js'

export async function getGradesOverview(
  userId: string,
  options: { search?: string } = {},
) {
  const enrolledCourses = await db
    .select({
      courseId: courses.id,
      moodleCourseId: courses.moodleCourseId,
      code: courses.code,
      title: courses.title,
      shortName: courses.shortName,
      cachedFinalGrade: enrollments.cachedFinalGrade,
      termLabel: academicTerms.label,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(academicTerms, eq(courses.termId, academicTerms.id))
    .where(and(eq(enrollments.userId, userId), eq(courses.visible, true)))
    .orderBy(asc(courses.title))

  const courseIds = enrolledCourses.map((c) => c.courseId)
  const itemsByCourse = new Map<number, Array<{ score: string | null; weight: string }>>()
  const coursesWithItems = new Set<number>()

  if (courseIds.length > 0) {
    const itemRows = await db
      .select({
        courseId: gradeItems.courseId,
        weight: gradeItems.weight,
        isHidden: gradeItems.isHiddenFromStudents,
        score: grades.score,
      })
      .from(gradeItems)
      .leftJoin(
        grades,
        and(eq(grades.gradeItemId, gradeItems.id), eq(grades.userId, userId)),
      )
      .where(inArray(gradeItems.courseId, courseIds))

    for (const item of itemRows) {
      coursesWithItems.add(item.courseId)
      if (item.isHidden) continue
      const list = itemsByCourse.get(item.courseId) ?? []
      list.push({ score: item.score, weight: item.weight })
      itemsByCourse.set(item.courseId, list)
    }
  }

  const searchTerm = options.search?.toLowerCase()
  const mappedCourses = enrolledCourses
    .filter(
      (c) =>
        !searchTerm ||
        c.title.toLowerCase().includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm),
    )
    .map((course) => {
      const visibleItems = itemsByCourse.get(course.courseId) ?? []
      const liveWeighted = computeWeightedCourseGrade(visibleItems)
      // When grade items exist (visible or hidden), rely solely on live visible math so hidden scores stay masked.
      const resolvedGradeStr = coursesWithItems.has(course.courseId)
        ? liveWeighted
        : (course.cachedFinalGrade ?? null)
      const finalGrade = resolvedGradeStr !== null ? Number(resolvedGradeStr) : null

      return {
        courseId: course.courseId,
        moodleCourseId: course.moodleCourseId,
        code: course.code,
        title: course.title,
        shortName: course.shortName,
        termLabel: course.termLabel,
        finalGrade,
        formattedGrade: formatGrade(resolvedGradeStr),
        letterGrade: getLetterGrade(finalGrade),
        gradedItemsCount: visibleItems.filter((item) => item.score !== null).length,
        totalItemsCount: visibleItems.length,
      }
    })

  return {
    title: 'Courses I am taking',
    courses: mappedCourses,
    summary: {
      totalCourses: mappedCourses.length,
      gradedCourses: mappedCourses.filter((c) => c.finalGrade !== null).length,
    },
  }
}
