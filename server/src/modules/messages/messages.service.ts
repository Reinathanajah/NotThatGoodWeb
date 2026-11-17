import { asc, count, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  conversationParticipants,
  conversations,
  messages,
  notifications,
  users,
} from '../../db/schema.js'
import {
  fetchLastMessagesByConversationIds,
  getParticipantsByConversationIds,
  verifyConversationParticipant,
} from './messages.queries.js'

export async function listUserConversations(userId: string) {
  const memberRows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      isGroup: conversations.isGroup,
      createdAt: conversations.createdAt,
    })
    .from(conversationParticipants)
    .innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
    .where(eq(conversationParticipants.userId, userId))

  if (memberRows.length === 0) return []

  const convIds = memberRows.map((c) => c.id)
  const [participantsMap, lastMessageMap] = await Promise.all([
    getParticipantsByConversationIds(convIds),
    fetchLastMessagesByConversationIds(convIds),
  ])

  const items = memberRows.map((conv) => ({
    ...conv,
    participants: participantsMap.get(conv.id) ?? [],
    lastMessage: lastMessageMap.get(conv.id) ?? null,
  }))

  items.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt.getTime() ?? a.createdAt.getTime()
    const bTime = b.lastMessage?.createdAt.getTime() ?? b.createdAt.getTime()
    return bTime - aTime
  })

  return items
}

export async function getConversationMessages(
  userId: string,
  conversationId: string,
  options: { offset: number; limit: number },
) {
  const conv = await verifyConversationParticipant(userId, conversationId)

  const [participantsMap, [totalRow], messageRows] = await Promise.all([
    getParticipantsByConversationIds([conversationId]),
    db
      .select({ total: count() })
      .from(messages)
      .where(eq(messages.conversationId, conversationId)),
    db
      .select({
        id: messages.id,
        body: messages.body,
        createdAt: messages.createdAt,
        sender: { id: users.id, fullName: users.fullName, role: users.role },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderUserId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(options.limit)
      .offset(options.offset),
  ])

  const total = Number(totalRow?.total ?? 0)
  return {
    conversation: conv,
    participants: participantsMap.get(conversationId) ?? [],
    messages: messageRows,
    pagination: {
      offset: options.offset,
      limit: options.limit,
      total,
      hasMore: options.offset + messageRows.length < total,
    },
  }
}

export async function sendConversationMessage(
  userId: string,
  conversationId: string,
  body: string,
) {
  await verifyConversationParticipant(userId, conversationId)

  const [sender] = await db
    .select({ id: users.id, fullName: users.fullName, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const createdMessage = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(messages)
      .values({ conversationId, senderUserId: userId, body })
      .returning()

    const participants = await tx
      .select({ userId: conversationParticipants.userId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversationId))

    const recipients = participants.map((p) => p.userId).filter((id) => id !== userId)
    if (recipients.length > 0) {
      await tx.insert(notifications).values(
        recipients.map((recipientId) => ({
          userId: recipientId,
          type: 'new_message',
          title: `New message from ${sender?.fullName ?? 'Member'}`,
          body: body.slice(0, 200),
          actionUrl: `/messages/${conversationId}`,
        })),
      )
    }

    return inserted
  })

  return {
    id: createdMessage.id,
    conversationId: createdMessage.conversationId,
    body: createdMessage.body,
    createdAt: createdMessage.createdAt,
    sender,
  }
}
