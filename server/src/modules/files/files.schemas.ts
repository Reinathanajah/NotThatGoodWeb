import { z } from 'zod'

export const privateFilesQuerySchema = z.object({
  folderId: z.string().uuid('folderId must be a valid UUID').optional(),
  view: z.enum(['grid', 'list', 'tree']).default('list'),
})

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Folder name is required')
    .max(255)
    .refine(
      (val) => !val.includes('/') && !val.includes('\\'),
      'Folder name cannot contain path separators',
    ),
  parentFolderId: z.string().uuid('parentFolderId must be a valid UUID').nullable().optional(),
})

export const uploadBodySchema = z.object({
  saveAs: z.string().trim().min(1).max(255).optional(),
  author: z.string().trim().min(1).max(200).optional(),
  license: z
    .enum(['all_rights_reserved', 'cc_by', 'cc_by_sa', 'public_domain'])
    .default('all_rights_reserved'),
  target: z.enum(['private', 'submission_draft']).default('private'),
  parentFolderId: z
    .string()
    .uuid('parentFolderId must be a valid UUID')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export const fileIdParamsSchema = z.object({
  fileId: z.string().uuid('fileId must be a valid UUID'),
})

export const fileDownloadQuerySchema = z.object({
  disposition: z.enum(['attachment', 'inline']).default('attachment'),
})
