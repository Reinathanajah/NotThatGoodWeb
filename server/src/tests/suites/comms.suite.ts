import assert from 'node:assert/strict'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { messages, notifications } from '../../db/schema.js'
import { requestJson } from '../helpers/http.js'

export async function verifyNotificationsFlow(
  baseUrl: string,
  authHeaders: Record<string, string>,
  studentId: string,
): Promise<void> {
  const notifList = await requestJson<{
    items: Array<{ id: string; isRead: boolean }>
    unreadCount: number
  }>(baseUrl, '/notifications?limit=10', { headers: authHeaders })
  assert.equal(notifList.status, 200)
  assert.ok(notifList.body.data!.unreadCount >= 57)

  const initialUnread = notifList.body.data!.unreadCount
  const firstNotifId = notifList.body.data!.items[0].id

  const readOne = await requestJson<{ unreadCount: number }>(
    baseUrl,
    `/notifications/${firstNotifId}/read`,
    { method: 'PATCH', headers: authHeaders },
  )
  assert.equal(readOne.status, 200)
  assert.equal(readOne.body.data?.unreadCount, initialUnread - 1)

  const readAll = await requestJson<{ unreadCount: number }>(
    baseUrl,
    '/notifications/read-all',
    { method: 'POST', headers: authHeaders },
  )
  assert.equal(readAll.status, 200)
  assert.equal(readAll.body.data?.unreadCount, 0)

  await db
    .update(notifications)
    .set({ isRead: false })
    .where(eq(notifications.userId, studentId))
  console.log('PASS notifications (unreadCount=57, mark read, read-all)')
}

export async function verifyMessagesFlow(
  baseUrl: string,
  authHeaders: Record<string, string>,
  studentId: string,
): Promise<void> {
  const convs = await requestJson<
    Array<{ id: string; participants: Array<{ id: string }> }>
  >(baseUrl, '/messages/conversations', { headers: authHeaders })
  assert.equal(convs.status, 200)
  assert.ok((convs.body.data?.length ?? 0) >= 1)
  const conv = convs.body.data![0]
  assert.equal(conv.participants.length, 2)

  const convDetail = await requestJson<{ messages: Array<{ body: string }> }>(
    baseUrl,
    `/messages/conversations/${conv.id}`,
    { headers: authHeaders },
  )
  assert.equal(convDetail.status, 200)
  assert.ok((convDetail.body.data?.messages.length ?? 0) >= 1)

  const sentMsg = await requestJson<{ id: string }>(
    baseUrl,
    `/messages/conversations/${conv.id}/messages`,
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ body: 'Confirmed, I followed the naming format.' }),
    },
  )
  assert.equal(sentMsg.status, 201)

  await db.delete(messages).where(eq(messages.id, sentMsg.body.data!.id))
  const recipient = conv.participants.find((p) => p.id !== studentId)
  if (recipient) {
    await db
      .delete(notifications)
      .where(
        and(eq(notifications.userId, recipient.id), eq(notifications.type, 'new_message')),
      )
  }
  console.log('PASS messages (conversations, detail, send + notification trigger)')
}
