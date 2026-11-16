import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { browserSessions, presenceHeartbeats, users } from '../../db/schema.js'
import {
  computeJwtExpiration,
  generateOpaqueToken,
  signAccessToken,
} from '../../utils/crypto.js'
import { NotFoundError } from '../../utils/errors.js'
import { getUserProfileById } from '../users/users.service.js'

export interface ClientMetadata {
  userAgent: string | null
  ipAddress: string | null
}

/** Issue a revocable JWT session and refresh user access and presence timestamps. */
export async function createSessionForUser(
  user: { id: string; role: string; firstAccessAt: Date | null },
  client: ClientMetadata,
) {
  const now = new Date()
  const jti = generateOpaqueToken(24)
  const expiresAt = computeJwtExpiration()

  const [session] = await db
    .insert(browserSessions)
    .values({
      userId: user.id,
      tokenJti: jti,
      userAgent: client.userAgent,
      ipAddress: client.ipAddress,
      lastActiveAt: now,
      expiresAt,
    })
    .returning()

  await Promise.all([
    db
      .update(users)
      .set({
        firstAccessAt: user.firstAccessAt ?? now,
        lastAccessAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, user.id)),
    db
      .insert(presenceHeartbeats)
      .values({ userId: user.id, lastSeenAt: now })
      .onConflictDoUpdate({
        target: presenceHeartbeats.userId,
        set: { lastSeenAt: now },
      }),
  ])

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    jti,
  })

  return { accessToken, session }
}

export async function logoutSession(userId: string, sessionId: string): Promise<void> {
  await db
    .update(browserSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(browserSessions.id, sessionId),
        eq(browserSessions.userId, userId),
        isNull(browserSessions.revokedAt),
      ),
    )
}

export async function getAuthenticatedProfile(userId: string) {
  return getUserProfileById(userId)
}

export async function listUserSessions(userId: string, currentSessionId: string) {
  const rows = await db
    .select({
      id: browserSessions.id,
      userAgent: browserSessions.userAgent,
      ipAddress: browserSessions.ipAddress,
      lastActiveAt: browserSessions.lastActiveAt,
      expiresAt: browserSessions.expiresAt,
      revokedAt: browserSessions.revokedAt,
      createdAt: browserSessions.createdAt,
    })
    .from(browserSessions)
    .where(eq(browserSessions.userId, userId))
    .orderBy(desc(browserSessions.lastActiveAt))

  const nowMs = Date.now()
  return rows.map((row) => ({
    ...row,
    isCurrent: row.id === currentSessionId,
    isActive: row.revokedAt === null && row.expiresAt.getTime() > nowMs,
  }))
}

export async function revokeUserSession(userId: string, targetSessionId: string) {
  const [updated] = await db
    .update(browserSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(browserSessions.id, targetSessionId),
        eq(browserSessions.userId, userId),
        isNull(browserSessions.revokedAt),
      ),
    )
    .returning({ id: browserSessions.id, revokedAt: browserSessions.revokedAt })

  if (!updated) {
    throw new NotFoundError('Active browser session not found')
  }

  return updated
}
