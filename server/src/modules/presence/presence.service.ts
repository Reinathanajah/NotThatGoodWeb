import { count, eq, gte } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { presenceHeartbeats, users } from '../../db/schema.js'

const ACTIVE_WINDOW_MINUTES = 5

export async function countOnlineUsers(windowMinutes = ACTIVE_WINDOW_MINUTES): Promise<number> {
  const cutoff = new Date(Date.now() - windowMinutes * 60_000)
  const [row] = await db
    .select({ total: count() })
    .from(presenceHeartbeats)
    .where(gte(presenceHeartbeats.lastSeenAt, cutoff))
  return Number(row?.total ?? 0)
}

export async function recordHeartbeat(userId: string) {
  const now = new Date()

  await Promise.all([
    db
      .insert(presenceHeartbeats)
      .values({ userId, lastSeenAt: now })
      .onConflictDoUpdate({
        target: presenceHeartbeats.userId,
        set: { lastSeenAt: now },
      }),
    db
      .update(users)
      .set({ lastAccessAt: now, updatedAt: now })
      .where(eq(users.id, userId)),
  ])

  const onlineCount = await countOnlineUsers()

  return {
    userId,
    lastSeenAt: now.toISOString(),
    activeWindowSeconds: ACTIVE_WINDOW_MINUTES * 60,
    onlineCount,
  }
}

export async function getOnlinePresence() {
  const onlineCount = await countOnlineUsers()
  return {
    onlineCount,
    activeWindowSeconds: ACTIVE_WINDOW_MINUTES * 60,
    sampledAt: new Date().toISOString(),
  }
}
