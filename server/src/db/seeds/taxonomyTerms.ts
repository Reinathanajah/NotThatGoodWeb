import { db } from '../index.js'
import { academicTerms } from '../schema.js'

export async function seedAcademicTerms() {
  const termsData = [
    {
      code: '2025',
      label: '2025',
      startAt: new Date('2025-01-01T00:00:00+07:00'),
      endAt: new Date('2025-12-31T23:59:59+07:00'),
    },
    {
      code: '2025-2026-fall',
      label: '2025-2026 Fall Term',
      startAt: new Date('2025-08-25T00:00:00+07:00'),
      endAt: new Date('2026-01-15T23:59:59+07:00'),
    },
    {
      code: '2025-2026-spring',
      label: '2025-2026 Spring Term',
      startAt: new Date('2026-02-02T00:00:00+07:00'),
      endAt: new Date('2026-06-30T23:59:59+07:00'),
    },
    {
      code: '2026-2027-fall',
      label: '2026-2027 Fall Term',
      startAt: new Date('2026-08-24T00:00:00+07:00'),
      endAt: new Date('2027-01-15T23:59:59+07:00'),
    },
  ]

  await db
    .insert(academicTerms)
    .values(termsData)
    .onConflictDoNothing({ target: academicTerms.code })
  const rows = await db.select().from(academicTerms)
  return new Map(rows.map((t) => [t.code, t.id]))
}
