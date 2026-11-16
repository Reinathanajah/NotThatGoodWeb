import { count, eq } from 'drizzle-orm'
import { db } from '../index.js'
import {
  calendarEvents,
  conversationParticipants,
  conversations,
  messages,
  notifications,
} from '../schema.js'

export async function seedCalendarAndMessaging(input: {
  studentId: string
  netLecturerId: string
  netCourseId: number
  labGroupId: number
  netLabCourseId: number
  optCourseId: number
  archCourseId: number
  probCourseId: number
  archMod1Id: number
  cs2ModId: number
}) {
  await db.insert(calendarEvents).values([
    {
      title: 'Pre-Lab Submission Overview',
      scope: 'course',
      courseId: input.netCourseId,
      startAt: new Date('2026-11-01T23:55:00+07:00'),
    },
    {
      title: 'Least Squares Assignment',
      scope: 'course',
      courseId: input.optCourseId,
      startAt: new Date('2026-11-02T13:00:00+07:00'),
    },
    {
      title: 'Architecture Case Study Quiz',
      scope: 'course',
      courseId: input.archCourseId,
      startAt: new Date('2026-11-02T16:00:00+07:00'),
    },
    {
      title: 'Module 1 Pre-Lab Submission',
      scope: 'course',
      courseId: input.netCourseId,
      startAt: new Date('2026-11-04T23:55:00+07:00'),
    },
    {
      title: 'Session 8 - Morning Lab',
      scope: 'group',
      courseId: input.netCourseId,
      groupId: input.labGroupId,
      startAt: new Date('2026-11-05T09:00:00+07:00'),
    },
    {
      title: 'Quiz Convolution',
      scope: 'course',
      courseId: input.probCourseId,
      startAt: new Date('2026-11-06T14:00:00+07:00'),
    },
    {
      title: 'Supplementary Lab Module 1',
      scope: 'course',
      courseId: input.netLabCourseId,
      startAt: new Date('2026-11-08T23:55:00+07:00'),
    },
    {
      title: 'Case Study Submission Module 1',
      scope: 'course',
      courseId: input.archCourseId,
      moduleId: input.archMod1Id,
      startAt: new Date('2026-11-16T09:50:00+07:00'),
    },
    {
      title: 'Case Study Submission Module 2',
      scope: 'course',
      courseId: input.netLabCourseId,
      moduleId: input.cs2ModId,
      startAt: new Date('2026-11-17T23:55:00+07:00'),
    },
    {
      title: 'Independent Midterm Review',
      scope: 'user',
      userId: input.studentId,
      startAt: new Date('2026-11-20T19:00:00+07:00'),
    },
  ])

  const [conv] = await db
    .insert(conversations)
    .values({ title: 'Telecomm Lab Teaching Assistant', isGroup: false })
    .returning()
  await db.insert(conversationParticipants).values([
    { conversationId: conv.id, userId: input.studentId },
    { conversationId: conv.id, userId: input.netLecturerId },
  ])
  await db.insert(messages).values({
    conversationId: conv.id,
    senderUserId: input.netLecturerId,
    body: 'Please follow the ModuleXX_Group_FullName naming convention before uploading reports.',
  })
}

export async function seedNotifications(studentId: string) {
  const [{ value: existingNotifCount }] = await db
    .select({ value: count() })
    .from(notifications)
    .where(eq(notifications.userId, studentId))

  if (existingNotifCount > 0) return

  const notifSeed = Array.from({ length: 57 }, (_, idx) => ({
    userId: studentId,
    type: idx % 2 === 0 ? 'assignment_due' : 'course_announcement',
    title:
      idx === 0
        ? 'Case Study Submission Module 2 due soon'
        : `Learning activity update #${57 - idx}`,
    body:
      idx === 0
        ? 'Case Study Submission Module 2 is due Tuesday, November 17, 2026 at 23:55.'
        : 'Activity and course resource reminder across your enrolled courses.',
    isRead: false,
  }))
  await db.insert(notifications).values(notifSeed)
}
