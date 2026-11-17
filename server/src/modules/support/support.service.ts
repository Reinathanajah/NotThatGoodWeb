import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { supportTickets, users } from '../../db/schema.js'
import { BadRequestError } from '../../utils/errors.js'

/** Return live chat availability, SilverFour helpdesk contacts, and accessibility defaults. */
export function getSupportStatus(auth?: { userId: string; role: string }) {
  return {
    liveChat: {
      status: 'offline' as const,
      statusLabel: 'Offline',
      provider: 'silverfour_helpdesk_chat',
      serviceHours: 'Monday - Friday, 08:00 - 16:00 UTC',
      timezone: 'UTC',
      offlineMessage:
        'Live chat support is currently offline. Submit a support ticket or email support@silverfour.edu.',
    },
    helpdesk: {
      name: 'SilverFour Helpdesk',
      email: 'support@silverfour.edu',
      locationUrl: '/static/platform_guides#helpdesk',
      guideUrl: '/static/platform_guides',
    },
    accessibilityWidget: {
      enabled: true,
      features: ['contrast', 'font_size', 'readable_font', 'highlight_links'],
    },
    viewer: auth
      ? { authenticated: true, role: auth.role }
      : { authenticated: false, role: 'guest' },
  }
}

/** Create a support ticket for either an authenticated user or a guest login visitor. */
export async function createSupportTicket(
  input: { email?: string; subject: string; message: string },
  authUserId?: string,
) {
  let resolvedEmail = input.email?.trim()

  if (!resolvedEmail && authUserId) {
    const [userRow] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, authUserId))
      .limit(1)
    resolvedEmail = userRow?.email
  }

  if (!resolvedEmail) {
    throw new BadRequestError('Email address is required when submitting a ticket as guest', [
      { field: 'email', message: 'Email is required' },
    ])
  }

  const [created] = await db
    .insert(supportTickets)
    .values({
      userId: authUserId ?? null,
      email: resolvedEmail,
      subject: input.subject,
      message: input.message,
      status: 'open',
    })
    .returning()

  return {
    id: created.id,
    referenceCode: `SUP-${created.id.slice(0, 8).toUpperCase()}`,
    userId: created.userId,
    email: created.email,
    subject: created.subject,
    message: created.message,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
  }
}
