import { count } from 'drizzle-orm'
import { db, pool } from './index.js'
import { courses } from './schema.js'
import { seedCalendarAndMessaging, seedNotifications } from './seeds/communications.js'
import { seedCompletionsAndGrades } from './seeds/completionAndGrades.js'
import { seedCoursesAndEnrollments } from './seeds/courses.js'
import { seedFileObjects } from './seeds/files.js'
import { seedLabAndArchActivities } from './seeds/labAndArchActivities.js'
import { seedNetworksActivities } from './seeds/networksActivities.js'
import { seedOptimizationActivities } from './seeds/optimizationActivities.js'
import { seedPortalAndNavigation } from './seeds/portal.js'
import { seedAcademicTerms, seedCategories } from './seeds/taxonomy.js'
import { seedUsers, syncMemberEnrollments } from './seeds/users.js'

async function seed() {
  console.log('Seeding SilverFour Neon database...')

  const categoryIds = await seedCategories()
  const { student, netLecturer, otnielUser, reinathanUser } = await seedUsers(categoryIds)
  const termMap = await seedAcademicTerms()

  const [{ value: existingCoursesCount }] = await db.select({ value: count() }).from(courses)
  if (existingCoursesCount === 0) {
    const { byMoodleId, labGroup } = await seedCoursesAndEnrollments({
      eceCategoryId: categoryIds.eceId,
      ceCategoryId: categoryIds.ceUndergradId,
      termMap,
      studentId: student.id,
      netLecturerId: netLecturer.id,
    })

    const files = await seedFileObjects({
      studentId: student.id,
      studentName: student.fullName,
      lecturerId: netLecturer.id,
      lecturerName: netLecturer.fullName,
    })

    const netCourse = byMoodleId.get(102037)!
    const secCourse = byMoodleId.get(102038)!
    const archCourse = byMoodleId.get(102039)!
    const probCourse = byMoodleId.get(102040)!
    const algCourse = byMoodleId.get(101003)!
    const optCourse = byMoodleId.get(812478)!
    const netLabCourse = byMoodleId.get(812679)!

    await seedNetworksActivities({
      networksCourseId: netCourse.id,
      module1FileId: files.modul1File.id,
      briefingFileId: files.pptBriefingFile.id,
    })

    const { cs2Mod, archMod1 } = await seedLabAndArchActivities({
      networksLabCourseId: netLabCourse.id,
      archCourseId: archCourse.id,
    })

    const { mlsWedMod } = await seedOptimizationActivities({
      optimizationCourseId: optCourse.id,
      vizPdfFileId: files.vizPdfFile.id,
      simHtmlFileId: files.simHtmlFile.id,
    })

    await seedCompletionsAndGrades({
      studentId: student.id,
      algCourseId: algCourse.id,
      secCourseId: secCourse.id,
      netLabCourseId: netLabCourse.id,
      optCourseId: optCourse.id,
      cs2ModId: cs2Mod.id,
      mlsWedModId: mlsWedMod.id,
    })

    await seedCalendarAndMessaging({
      studentId: student.id,
      netLecturerId: netLecturer.id,
      netCourseId: netCourse.id,
      labGroupId: labGroup.id,
      netLabCourseId: netLabCourse.id,
      optCourseId: optCourse.id,
      archCourseId: archCourse.id,
      probCourseId: probCourse.id,
      archMod1Id: archMod1.id,
      cs2ModId: cs2Mod.id,
    })
  }

  await seedPortalAndNavigation()
  await seedNotifications(student.id)
  await syncMemberEnrollments([otnielUser.id, reinathanUser.id])

  console.log('Seed completed successfully for users:', [
    student.username,
    otnielUser.username,
    reinathanUser.username,
  ])
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
