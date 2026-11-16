import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { env } from '../config/env.js'
import { BadRequestError } from './errors.js'

export function resolveSafeStoragePath(storageKey: string): string {
  const uploadRoot =
    process.env.VERCEL && !path.isAbsolute(env.UPLOAD_DIR)
      ? path.join(os.tmpdir(), env.UPLOAD_DIR)
      : path.resolve(process.cwd(), env.UPLOAD_DIR)
  const targetPath = path.resolve(uploadRoot, storageKey)
  const relative = path.relative(uploadRoot, targetPath)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new BadRequestError('Invalid storage path')
  }
  return targetPath
}

export async function saveUploadedBuffer(
  storageKey: string,
  buffer: Buffer,
): Promise<string> {
  const diskPath = resolveSafeStoragePath(storageKey)
  await fs.mkdir(path.dirname(diskPath), { recursive: true })
  await fs.writeFile(diskPath, buffer)
  return diskPath
}

export async function removeStoredFileIfExists(storageKey: string): Promise<void> {
  const diskPath = resolveSafeStoragePath(storageKey)
  try {
    await fs.unlink(diskPath)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
  }
}

export async function readFileObjectBytes(file: {
  storageKey: string
  mimeType: string
  displayName: string
  originalName: string
}): Promise<{ buffer: Buffer; isSeededStub: boolean } | null> {
  const diskPath = resolveSafeStoragePath(file.storageKey)
  try {
    const buffer = await fs.readFile(diskPath)
    return { buffer, isSeededStub: false }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') throw err
  }

  if (!file.storageKey.startsWith('courses/') && !file.storageKey.startsWith('private/')) {
    return null
  }

  if (file.mimeType === 'text/html') {
    const safeTitle = file.displayName.replace(/[<>&"]/g, '')
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${safeTitle}</title></head><body><h1>${safeTitle}</h1><p>Seeded HTML simulation placeholder (${file.originalName}).</p></body></html>`
    return { buffer: Buffer.from(html, 'utf8'), isSeededStub: true }
  }

  const pdfPlaceholder = `%PDF-1.4\n% Seeded resource placeholder for ${file.originalName}\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Count 0 /Kids [] >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n`
  return { buffer: Buffer.from(pdfPlaceholder, 'utf8'), isSeededStub: true }
}
