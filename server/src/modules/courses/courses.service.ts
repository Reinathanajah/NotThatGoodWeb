export {
  requireEnrolledCourse,
  resolveAdjacentModules,
  resolveCourseByIdOrMoodleId,
  resolveCourseModuleByIdOrMoodleId,
} from './courses.access.js'
export {
  computeCourseCompletionMap,
  setModuleCompletion,
} from './courses.completion.js'
export { getCourseDetail } from './courses.detail.js'
export {
  listMyCourses,
  type CourseOverviewFilter,
  type CourseOverviewSort,
} from './courses.overview.js'
export {
  listRecentCourses,
  recordCourseAccess,
  updateCoursePreference,
} from './courses.preferences.js'
export { getCourseSections } from './courses.sections.js'
