import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { mobileQrTokens, users } from '../../db/schema.js'
import { generateOpaqueToken, sha256Hex } from '../../utils/crypto.js'
import { UnauthorizedError } from '../../utils/errors.js'
import {
  type ClientMetadata,
  createSessionForUser,
  getAuthenticatedProfile,
} from './auth.session.js'

export async function createMobileQrToken(userId: string) {
  const rawToken = generateOpaqueToken(24)
  const expiresAt = new Date(Date.now() + 10 * 60_000)

  await db.insert(mobileQrTokens).values({
    userId,
    tokenHash: sha256Hex(rawToken),
    expiresAt,
  })

  return {
    qrToken: rawToken,
    qrUri: `silverfour://link?token=${rawToken}`,
    expiresAt: expiresAt.toISOString(),
  }
}

/** Atomically consume a single-use QR token inside a transaction to prevent replay races. */
export async function exchangeMobileQrToken(rawToken: string, client: ClientMetadata) {
  const now = new Date()
  const tokenHash = sha256Hex(rawToken)

  const user = await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(mobileQrTokens)
      .set({ usedAt: now })
      .where(
        and(
          eq(mobileQrTokens.tokenHash, tokenHash),
          isNull(mobileQrTokens.usedAt),
          gt(mobileQrTokens.expiresAt, now),
        ),
      )
      .returning({ userId: mobileQrTokens.userId })

    if (!claimed) {
      throw new UnauthorizedError('Mobile QR token is invalid or has expired')
    }

    const [foundUser] = await tx
      .select()
      .from(users)
      .where(eq(users.id, claimed.userId))
      .limit(1)
    if (!foundUser || !foundUser.isActive) {
      throw new UnauthorizedError('Account is inactive')
    }

    return foundUser
  })

  const { accessToken, session } = await createSessionForUser(user, client)
  const profile = await getAuthenticatedProfile(user.id)

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresAt: session.expiresAt.toISOString(),
    sessionId: session.id,
    user: profile,
  }
}
