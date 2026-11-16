import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courses, notifications } from '../../db/schema.js'
import { NotFoundError } from '../../utils/errors.js'

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
  return Number(row?.total ?? 0)
}

export async function listUserNotifications(
  userId: string,
  options: { unreadOnly: boolean; page: number; limit: number },
) {
  const whereClause = options.unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.userId, userId)

  const offset = (options.page - 1) * options.limit

  const [[totalRow], unreadCount, items] = await Promise.all([
    db.select({ total: count() }).from(notifications).where(whereClause),
    getUnreadNotificationCount(userId),
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        body: notifications.body,
        actionUrl: notifications.actionUrl,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        courseId: notifications.courseId,
        courseTitle: courses.title,
      })
      .from(notifications)
      .leftJoin(courses, eq(notifications.courseId, courses.id))
      .where(whereClause)
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(options.limit)
      .offset(offset),
  ])

  const total = Number(totalRow?.total ?? 0)

  return {
    items,
    unreadCount,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / options.limit)),
    },
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning()

  if (!updated) {
    throw new NotFoundError('Notification not found')
  }

  const unreadCount = await getUnreadNotificationCount(userId)
  return { notification: updated, unreadCount }
}

export async function markAllNotificationsRead(userId: string) {
  const updatedRows = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .returning({ id: notifications.id })

  return {
    markedCount: updatedRows.length,
    unreadCount: 0,
  }
}
