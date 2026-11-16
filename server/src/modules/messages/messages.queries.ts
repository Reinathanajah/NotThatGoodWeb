import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  conversationParticipants,
  conversations,
  messages,
  users,
} from '../../db/schema.js'
import { ForbiddenError, NotFoundError } from '../../utils/errors.js'

export async function verifyConversationParticipant(userId: string, conversationId: string) {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)

  if (!conv) {
    throw new NotFoundError('Conversation not found')
  }

  const [participant] = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    )
    .limit(1)

  if (!participant) {
    throw new ForbiddenError('You are not a participant in this conversation')
  }

  return conv
}

export async function getParticipantsByConversationIds(conversationIds: string[]) {
  if (conversationIds.length === 0) {
    return new Map<string, Array<{ id: string; fullName: string; role: string }>>()
  }

  const rows = await db
    .select({
      conversationId: conversationParticipants.conversationId,
      id: users.id,
      fullName: users.fullName,
      role: users.role,
    })
    .from(conversationParticipants)
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(inArray(conversationParticipants.conversationId, conversationIds))

  const map = new Map<string, Array<{ id: string; fullName: string; role: string }>>()
  for (const r of rows) {
    const list = map.get(r.conversationId) ?? []
    list.push({ id: r.id, fullName: r.fullName, role: r.role })
    map.set(r.conversationId, list)
  }
  return map
}

/** Fetch only the latest message per conversation via PostgreSQL DISTINCT ON. */
export async function fetchLastMessagesByConversationIds(conversationIds: string[]) {
  const map = new Map<
    string,
    { id: string; senderUserId: string; body: string; createdAt: Date }
  >()
  if (conversationIds.length === 0) return map

  const rows = await db
    .selectDistinctOn([messages.conversationId], {
      id: messages.id,
      conversationId: messages.conversationId,
      senderUserId: messages.senderUserId,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(inArray(messages.conversationId, conversationIds))
    .orderBy(messages.conversationId, desc(messages.createdAt), desc(messages.id))

  for (const row of rows) {
    map.set(row.conversationId, {
      id: row.id,
      senderUserId: row.senderUserId,
      body: row.body,
      createdAt: row.createdAt,
    })
  }
  return map
}
