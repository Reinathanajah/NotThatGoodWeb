import { and, eq, gt, isNull, or } from 'drizzle-orm'
import { env } from '../../config/env.js'
import { db } from '../../db/index.js'
import { browserSessions, passwordResetTokens, users } from '../../db/schema.js'
import { generateOpaqueToken, hashPassword, sha256Hex } from '../../utils/crypto.js'
import { BadRequestError } from '../../utils/errors.js'

export async function requestPasswordReset(identifier: string) {
  const normalized = identifier.trim().toLowerCase()
  const [user] = await db
    .select({ id: users.id, isActive: users.isActive })
    .from(users)
    .where(or(eq(users.username, normalized), eq(users.email, normalized)))
    .limit(1)

  if (!user || !user.isActive) {
    return {
      accepted: true,
      message: 'If the account exists, password reset instructions have been issued.',
    }
  }

  const rawToken = generateOpaqueToken(24)
  const expiresAt = new Date(Date.now() + 30 * 60_000)

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: sha256Hex(rawToken),
    expiresAt,
  })

  return {
    accepted: true,
    message: 'If the account exists, password reset instructions have been issued.',
    ...(env.NODE_ENV !== 'production' ? { devResetToken: rawToken, expiresAt } : {}),
  }
}

/** Claim a password reset token atomically before updating password and revoking sessions. */
export async function resetPasswordWithToken(rawToken: string, newPassword: string) {
  const now = new Date()
  const tokenHash = sha256Hex(rawToken)
  // Hash password outside the DB transaction to avoid holding locks during bcrypt work.
  const passwordHash = await hashPassword(newPassword)

  await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .returning({ userId: passwordResetTokens.userId })

    if (!claimed) {
      throw new BadRequestError('Reset token is invalid or has expired')
    }

    await Promise.all([
      tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, claimed.userId)),
      tx
        .update(browserSessions)
        .set({ revokedAt: now })
        .where(
          and(eq(browserSessions.userId, claimed.userId), isNull(browserSessions.revokedAt)),
        ),
    ])
  })

  return { reset: true }
}
