import assert from 'node:assert/strict'
import { db } from '../../db/index.js'
import { staticPages } from '../../db/schema.js'
import { requestJson } from '../helpers/http.js'

export async function verifyPublicStaticPagesAndGuestSupport(
  baseUrl: string,
  createdTicketIds: string[],
): Promise<string> {
  const roleGuides = await requestJson<{ slug: string; links: unknown[] }>(
    baseUrl,
    '/static-pages/role_guides',
  )
  assert.equal(roleGuides.status, 200)
  assert.equal(roleGuides.body.data?.slug, 'role_guides')
  assert.equal(roleGuides.body.data?.links.length, 3)
  assert.equal(roleGuides.headers.get('cache-control'), 'public, max-age=300')

  assert.equal((await requestJson(baseUrl, '/static-pages/privacy_summary')).status, 200)
  assert.equal((await requestJson(baseUrl, '/static-pages/cookies_notice')).status, 200)
  assert.equal((await requestJson(baseUrl, '/static-pages/platform_guides')).status, 200)
  assert.equal((await requestJson(baseUrl, '/static-pages/missing-slug-404')).status, 404)

  const tempPrivateSlug = `internal_wave10_${Date.now()}`
  await db.insert(staticPages).values({
    slug: tempPrivateSlug,
    title: 'Internal Policy',
    contentMarkdown: 'Hanya untuk pengguna terautentikasi.',
    linksJson: [],
    isPublic: false,
  })
  assert.equal((await requestJson(baseUrl, `/static-pages/${tempPrivateSlug}`)).status, 401)

  const guestSupport = await requestJson<{
    liveChat: { status: string }
    helpdesk: { email: string }
    viewer: { authenticated: boolean }
  }>(baseUrl, '/support/status')
  assert.equal(guestSupport.status, 200)
  assert.equal(guestSupport.body.data?.liveChat.status, 'offline')
  assert.equal(guestSupport.body.data?.helpdesk.email, 'support@silverfour.edu')
  assert.equal(guestSupport.body.data?.viewer.authenticated, false)

  assert.equal(
    (
      await requestJson(baseUrl, '/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Guest Sign-In Issue',
          message: 'Did not receive OTP code when attempting sign in.',
        }),
      })
    ).status,
    400,
  )

  const guestTicket = await requestJson<{
    id: string
    referenceCode: string
    userId: string | null
  }>(baseUrl, '/support/tickets', {
    method: 'POST',
    body: JSON.stringify({
      email: 'guest.wave10@silverfour.edu',
      subject: 'Guest Sign-In Support Request',
      message: 'Please help verify initial term portal access.',
    }),
  })
  assert.equal(guestTicket.status, 201)
  assert.ok(guestTicket.body.data?.referenceCode.startsWith('SUP-'))
  assert.equal(guestTicket.body.data?.userId, null)
  createdTicketIds.push(guestTicket.body.data!.id)
  console.log('PASS public static pages & guest support status/ticket')

  return tempPrivateSlug
}

export async function verifyAuthenticatedSupport(
  baseUrl: string,
  authHeaders: Record<string, string>,
  studentId: string,
  studentEmail: string,
  createdTicketIds: string[],
): Promise<void> {
  const authSupport = await requestJson<{
    viewer: { authenticated: boolean; role: string }
  }>(baseUrl, '/support/status', { headers: authHeaders })
  assert.equal(authSupport.status, 200)
  assert.equal(authSupport.body.data?.viewer.authenticated, true)
  assert.equal(authSupport.body.data?.viewer.role, 'student')

  const authTicket = await requestJson<{
    id: string
    userId: string | null
    email: string
    status: string
  }>(baseUrl, '/support/tickets', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      subject: 'Attendance Sync Issue',
      message: 'Lab attendance status has not appeared on the course page.',
    }),
  })
  assert.equal(authTicket.status, 201)
  assert.equal(authTicket.body.data?.userId, studentId)
  assert.equal(authTicket.body.data?.email, studentEmail)
  assert.equal(authTicket.body.data?.status, 'open')
  createdTicketIds.push(authTicket.body.data!.id)
  console.log('PASS authenticated support status & ticket creation')
}
