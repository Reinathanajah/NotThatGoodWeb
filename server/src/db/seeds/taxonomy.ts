import { eq } from 'drizzle-orm'
import { db } from '../index.js'
import { categories } from '../schema.js'

export { seedAcademicTerms } from './taxonomyTerms.js'

const FACULTIES = [
  { name: 'Faculty of Medicine', slug: 'medicine', moodleId: 1001 },
  { name: 'Faculty of Dentistry', slug: 'dentistry', moodleId: 1002 },
  { name: 'Faculty of Public Health', slug: 'public-health', moodleId: 1003 },
  { name: 'Faculty of Nursing', slug: 'nursing', moodleId: 1004 },
  { name: 'Faculty of Pharmacy', slug: 'pharmacy', moodleId: 1005 },
  { name: 'Faculty of Science & Mathematics', slug: 'science', moodleId: 1401 },
  { name: 'Faculty of Engineering', slug: 'engineering', moodleId: 1007 },
  { name: 'Faculty of Computer Science', slug: 'computer-science', moodleId: 1008 },
  { name: 'Faculty of Law', slug: 'law', moodleId: 1009 },
  { name: 'Faculty of Economics & Business', slug: 'economics-business', moodleId: 1010 },
  { name: 'Faculty of Humanities', slug: 'humanities', moodleId: 1011 },
  { name: 'Faculty of Psychology', slug: 'psychology', moodleId: 1012 },
  { name: 'Faculty of Administrative Science', slug: 'administrative-science', moodleId: 1013 },
  { name: 'Faculty of Social & Political Sciences', slug: 'social-political', moodleId: 1014 },
  { name: 'Graduate School', slug: 'graduate-school', moodleId: 1015 },
  { name: 'Vocational Studies', slug: 'vocational', moodleId: 1016 },
  { name: 'Credit Transfer Program', slug: 'credit-transfer', moodleId: 1017 },
]

const MED_SUBCATEGORIES = [
  { name: 'B.Med. Medical Sciences', slug: 'med-undergrad' },
  { name: 'International Track - Medical Sciences', slug: 'med-intl' },
  { name: 'Clinical Clerkship Program', slug: 'med-clerkship' },
  { name: 'Residency - Urology', slug: 'med-urology' },
  { name: 'Residency - Emergency Medicine', slug: 'med-emergency' },
  { name: 'Fellowship - Cardiology & Vascular Medicine', slug: 'med-cardiology' },
  { name: 'Fellowship - Ophthalmology', slug: 'med-ophthalmology' },
  { name: 'Fellowship - Dermatology & Aesthetics', slug: 'med-dermatology' },
]

async function ensureCategory(input: {
  moodleCategoryId?: number
  parentId: number | null
  name: string
  slug: string
  pathPrefix: string
  depth: number
  sortOrder: number
}): Promise<number> {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, input.slug))
    .limit(1)
  if (existing[0]) return existing[0].id

  const [inserted] = await db
    .insert(categories)
    .values({
      moodleCategoryId: input.moodleCategoryId ?? null,
      parentId: input.parentId,
      name: input.name,
      slug: input.slug,
      path: input.pathPrefix,
      depth: input.depth,
      sortOrder: input.sortOrder,
    })
    .returning({ id: categories.id })

  const resolvedPath = `${input.pathPrefix}/${inserted.id}`
  await db.update(categories).set({ path: resolvedPath }).where(eq(categories.id, inserted.id))
  return inserted.id
}

export async function seedCategories() {
  const universityRootId = await ensureCategory({
    moodleCategoryId: 1,
    parentId: null,
    name: 'University Catalog',
    slug: 'university',
    pathPrefix: '',
    depth: 0,
    sortOrder: 1,
  })

  const facultyIds = new Map<string, number>()
  for (let i = 0; i < FACULTIES.length; i++) {
    const f = FACULTIES[i]
    const id = await ensureCategory({
      moodleCategoryId: f.moodleId,
      parentId: universityRootId,
      name: f.name,
      slug: f.slug,
      pathPrefix: `/${universityRootId}`,
      depth: 1,
      sortOrder: i + 1,
    })
    facultyIds.set(f.slug, id)
  }

  const medicineId = facultyIds.get('medicine')!
  for (let i = 0; i < MED_SUBCATEGORIES.length; i++) {
    await ensureCategory({
      parentId: medicineId,
      name: MED_SUBCATEGORIES[i].name,
      slug: MED_SUBCATEGORIES[i].slug,
      pathPrefix: `/${universityRootId}/${medicineId}`,
      depth: 2,
      sortOrder: i + 1,
    })
  }

  const engineeringId = facultyIds.get('engineering')!
  const eceId = await ensureCategory({
    parentId: engineeringId,
    name: 'Electrical & Computer Engineering',
    slug: 'eng-ece',
    pathPrefix: `/${universityRootId}/${engineeringId}`,
    depth: 2,
    sortOrder: 1,
  })
  const ceUndergradId = await ensureCategory({
    parentId: eceId,
    name: 'B.Eng. Computer Engineering',
    slug: 'eng-ce-undergrad',
    pathPrefix: `/${universityRootId}/${engineeringId}/${eceId}`,
    depth: 3,
    sortOrder: 1,
  })

  return { universityRootId, engineeringId, eceId, ceUndergradId }
}
