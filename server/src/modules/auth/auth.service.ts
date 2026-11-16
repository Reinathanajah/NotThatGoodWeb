import { eq, or } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { verifyPassword } from '../../utils/crypto.js'
import { UnauthorizedError } from '../../utils/errors.js'
import {
  type ClientMetadata,
  createSessionForUser,
  getAuthenticatedProfile,
} from './auth.session.js'

export { createMobileQrToken, exchangeMobileQrToken } from './auth.mobileQr.js'
export { requestPasswordReset, resetPasswordWithToken } from './auth.password.js'
export {
  getAuthenticatedProfile,
  listUserSessions,
  logoutSession,
  revokeUserSession,
} from './auth.session.js'

export async function loginUser(
  identifier: string,
  password: string,
  client: ClientMetadata,
) {
  const normalized = identifier.trim().toLowerCase()
  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.username, normalized), eq(users.email, normalized)))
    .limit(1)

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid username/email or password')
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    throw new UnauthorizedError('Invalid username/email or password')
  }

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
