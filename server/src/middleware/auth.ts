import type { NextFunction, Request, Response } from 'express'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '../db/index.js'
import { browserSessions, presenceHeartbeats, users } from '../db/schema.js'
import { verifyAccessToken } from '../utils/crypto.js'
import { UnauthorizedError } from '../utils/errors.js'

export interface AuthContext {
  userId: string
  role: string
  sessionId: string
  tokenJti: string
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext
    }
  }
}

async function resolveSessionFromHeader(header?: string): Promise<AuthContext | null> {
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header')
  }

  const token = header.slice('Bearer '.length).trim()
  let payload: { sub: string; role: string; jti: string }
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new UnauthorizedError('Invalid or expired access token')
  }

  const now = new Date()
  const [session] = await db
    .select({
      id: browserSessions.id,
      userId: browserSessions.userId,
      role: users.role,
      isActive: users.isActive,
    })
    .from(browserSessions)
    .innerJoin(users, eq(browserSessions.userId, users.id))
    .where(
      and(
        eq(browserSessions.tokenJti, payload.jti),
        eq(browserSessions.userId, payload.sub),
        isNull(browserSessions.revokedAt),
        gt(browserSessions.expiresAt, now),
      ),
    )
    .limit(1)

  if (!session || !session.isActive) {
    throw new UnauthorizedError('Session has expired or been revoked')
  }

  await Promise.all([
    db
      .update(browserSessions)
      .set({ lastActiveAt: now })
      .where(eq(browserSessions.id, session.id)),
    db
      .insert(presenceHeartbeats)
      .values({ userId: session.userId, lastSeenAt: now })
      .onConflictDoUpdate({
        target: presenceHeartbeats.userId,
        set: { lastSeenAt: now },
      }),
  ])

  return {
    userId: session.userId,
    role: session.role,
    sessionId: session.id,
    tokenJti: payload.jti,
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    req.auth = (await resolveSessionFromHeader(req.headers.authorization)) ?? undefined
    next()
  } catch (err) {
    next(err)
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.headers.authorization) {
    next()
    return
  }

  try {
    req.auth = (await resolveSessionFromHeader(req.headers.authorization)) ?? undefined
    next()
  } catch (err) {
    next(err)
  }
}
