import { hashPassword } from '../../utils/crypto.js'
import { db } from '../index.js'
import {
  courseAccessLogs,
  courses,
  enrollments,
  userPreferences,
  users,
} from '../schema.js'

export interface SeedCategoryIds {
  universityRootId: number
  engineeringId: number
  eceId: number
  ceUndergradId: number
}

export async function ensureStudentAccount(input: {
  username: string
  email: string
  passwordPlain: string
  fullName: string
  studentIdNumber: string
  cats: SeedCategoryIds
}) {
  const passwordHash = await hashPassword(input.passwordPlain)
  const [user] = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: 'student',
      studentIdNumber: input.studentIdNumber,
      facultyCategoryId: input.cats.engineeringId,
      programCategoryId: input.cats.ceUndergradId,
      emailVisibility: 'course_participants',
      country: 'Global',
      city: 'Main Campus',
      timezone: 'UTC',
      preferredLang: 'en',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.username,
      set: {
        passwordHash,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning()

  await db
    .insert(userPreferences)
    .values({
      userId: user.id,
      editMode: false,
      courseOverviewFilter: 'all',
      courseOverviewSort: 'name',
      courseOverviewView: 'list',
      courseOverviewPageSize: 12,
      calendarHiddenScopes: [],
    })
    .onConflictDoNothing({ target: userPreferences.userId })

  return user
}

export async function syncMemberEnrollments(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return
  const allCourses = await db
    .select({ id: courses.id, moodleCourseId: courses.moodleCourseId })
    .from(courses)
  if (allCourses.length === 0) return

  for (const userId of userIds) {
    await db
      .insert(enrollments)
      .values(allCourses.map((c) => ({ userId, courseId: c.id, role: 'student' as const })))
      .onConflictDoNothing()

    const featured = allCourses.filter((c) =>
      [102037, 102039, 102040, 812478].includes(c.moodleCourseId ?? -1),
    )
    if (featured.length > 0) {
      await db
        .insert(courseAccessLogs)
        .values(featured.map((c) => ({ userId, courseId: c.id, lastAccessedAt: new Date() })))
        .onConflictDoNothing()
    }
  }
}
