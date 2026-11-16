import { Router } from 'express'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index.js'
import { fileObjects, users } from '../../db/schema.js'
import { requireAuth } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validate.js'
import { sendSuccess } from '../../utils/response.js'
import { listPrivateFiles } from '../files/files.service.js'

const filePickerQuerySchema = z.object({
  source: z.enum(['all', 'recent', 'private', 'wikimedia']).default('all'),
  q: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
})

const WIKIMEDIA_CATALOG = [
  {
    title: 'University_crest_icon.svg',
    url: 'https://commons.wikimedia.org/wiki/File:University_crest_icon.svg',
    mimeType: 'image/svg+xml',
    license: 'public_domain',
    author: 'Wikimedia Commons Contributors',
  },
  {
    title: 'OSI_Model_Layers_Diagram.svg',
    url: 'https://commons.wikimedia.org/wiki/File:OSI_Model_Layers_Diagram.svg',
    mimeType: 'image/svg+xml',
    license: 'cc_by_sa',
    author: 'Wikimedia Commons Contributors',
  },
  {
    title: 'Least_squares_linear_regression.svg',
    url: 'https://commons.wikimedia.org/wiki/File:Least_squares_linear_regression.svg',
    mimeType: 'image/svg+xml',
    license: 'cc_by_sa',
    author: 'Wikimedia Commons Contributors',
  },
]

const LICENSES = [
  { code: 'all_rights_reserved', label: 'All rights reserved' },
  { code: 'cc_by', label: 'Creative Commons - Attribution' },
  { code: 'cc_by_sa', label: 'Creative Commons - ShareAlike' },
  { code: 'public_domain', label: 'Public domain' },
]

export const filePickerRouter = Router()

filePickerRouter.get(
  '/sources',
  requireAuth,
  validateRequest({ query: filePickerQuerySchema }),
  async (req, res) => {
    const { source, q, limit } = req.validated!.query as {
      source: 'all' | 'recent' | 'private' | 'wikimedia'
      q?: string
      limit: number
    }
    const userId = req.auth!.userId
    const want = (target: 'recent' | 'private' | 'wikimedia') =>
      source === 'all' || source === target

    const [[userRow], recentFiles, privateData] = await Promise.all([
      db
        .select({ fullName: users.fullName })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1),
      want('recent')
        ? db
            .select({
              id: fileObjects.id,
              originalName: fileObjects.originalName,
              displayName: fileObjects.displayName,
              mimeType: fileObjects.mimeType,
              sizeBytes: fileObjects.sizeBytes,
              authorName: fileObjects.authorName,
              license: fileObjects.license,
              uploadedAt: fileObjects.uploadedAt,
            })
            .from(fileObjects)
            .where(eq(fileObjects.ownerUserId, userId))
            .orderBy(desc(fileObjects.uploadedAt))
            .limit(limit)
        : Promise.resolve([]),
      want('private')
        ? listPrivateFiles(userId, { view: 'tree' })
        : Promise.resolve(null),
    ])

    const queryLower = q?.toLowerCase()
    const wikimediaResults = want('wikimedia')
      ? WIKIMEDIA_CATALOG.filter((item) =>
          queryLower ? item.title.toLowerCase().includes(queryLower) : true,
        ).slice(0, limit)
      : []

    sendSuccess(res, {
      source,
      repositories: [
        { id: 'recent', label: 'Recent files', writable: false },
        { id: 'upload', label: 'Upload a file', writable: true },
        { id: 'private', label: 'Private files', writable: true },
        { id: 'wikimedia', label: 'Wikimedia', writable: false },
      ],
      uploadDefaults: {
        author: userRow?.fullName ?? '',
        defaultLicense: 'all_rights_reserved',
        licenses: LICENSES,
      },
      recentFiles: recentFiles.map((f) => ({
        ...f,
        downloadUrl: `/api/v1/files/${f.id}/download`,
      })),
      privateFiles: privateData?.entries ?? [],
      wikimediaResults,
    })
  },
)
