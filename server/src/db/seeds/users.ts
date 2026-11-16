import { eq } from 'drizzle-orm'
import { hashPassword } from '../../utils/crypto.js'
import { db } from '../index.js'
import { presenceHeartbeats, userPreferences, users } from '../schema.js'
import { ensureStudentAccount, type SeedCategoryIds } from './userMembers.js'

export { syncMemberEnrollments } from './userMembers.js'

export async function seedUsers(cats: SeedCategoryIds) {
  const defaultPasswordHash = await hashPassword('Password123!')

  await db
    .insert(users)
    .values([
      {
        username: 'student.demo',
        email: 'student.demo@silverfour.edu',
        passwordHash: defaultPasswordHash,
        fullName: 'Jordan Rivera',
        role: 'student',
        studentIdNumber: '2506000001',
        facultyCategoryId: cats.engineeringId,
        programCategoryId: cats.ceUndergradId,
        emailVisibility: 'course_participants',
        country: 'Global',
        city: 'Main Campus',
        timezone: 'UTC',
        preferredLang: 'en',
        firstAccessAt: new Date('2025-08-25T10:04:00+07:00'),
        lastAccessAt: new Date('2026-11-16T22:32:00+07:00'),
      },
      {
        username: 'instructor.networks',
        email: 'instructor.networks@silverfour.edu',
        passwordHash: defaultPasswordHash,
        fullName: 'Dr. Morgan Chen',
        role: 'lecturer',
        facultyCategoryId: cats.engineeringId,
        programCategoryId: cats.eceId,
        timezone: 'UTC',
        preferredLang: 'en',
      },
      {
        username: 'instructor.linear',
        email: 'instructor.linear@silverfour.edu',
        passwordHash: defaultPasswordHash,
        fullName: 'Dr. Taylor Kim',
        role: 'lecturer',
        facultyCategoryId: cats.engineeringId,
        programCategoryId: cats.ceUndergradId,
        timezone: 'UTC',
        preferredLang: 'en',
      },
      {
        username: 'admin.silverfour',
        email: 'support@silverfour.edu',
        passwordHash: defaultPasswordHash,
        fullName: 'SilverFour Helpdesk Admin',
        role: 'admin',
        facultyCategoryId: cats.universityRootId,
        timezone: 'UTC',
        preferredLang: 'en',
      },
    ])
    .onConflictDoNothing({ target: users.username })

  const otnielUser = await ensureStudentAccount({
    username: 'otnielkris',
    email: 'otnielkris@silverfour.edu',
    passwordPlain: 'otniel123',
    fullName: 'Otniel Kris',
    studentIdNumber: '2506000002',
    cats,
  })
  const reinathanUser = await ensureStudentAccount({
    username: 'reinathanez',
    email: 'reinathanez@silverfour.edu',
    passwordPlain: 'reinathan123',
    fullName: 'Reinathan Ez',
    studentIdNumber: '2506000003',
    cats,
  })

  const [student] = await db.select().from(users).where(eq(users.username, 'student.demo')).limit(1)
  const [netLecturer] = await db
    .select()
    .from(users)
    .where(eq(users.username, 'instructor.networks'))
    .limit(1)

  if (!student || !netLecturer) {
    throw new Error('Failed to load seeded users.')
  }

  await db
    .insert(userPreferences)
    .values({
      userId: student.id,
      editMode: false,
      courseOverviewFilter: 'all',
      courseOverviewSort: 'name',
      courseOverviewView: 'list',
      courseOverviewPageSize: 12,
      calendarHiddenScopes: [],
    })
    .onConflictDoNothing({ target: userPreferences.userId })

  await db
    .insert(presenceHeartbeats)
    .values([
      { userId: student.id, lastSeenAt: new Date() },
      { userId: netLecturer.id, lastSeenAt: new Date() },
    ])
    .onConflictDoUpdate({
      target: presenceHeartbeats.userId,
      set: { lastSeenAt: new Date() },
    })

  return { student, netLecturer, otnielUser, reinathanUser }
}
