import assert from 'node:assert/strict'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { fileObjects } from '../db/schema.js'
import {
  loginAccount,
  logoutAccount,
  requestJson,
  withTestServer,
} from './helpers/http.js'
import { verifyPrivateFoldersAndUpload } from './suites/filesPrivate.suite.js'

void withTestServer('Wave 7', async (baseUrl) => {
  assert.equal((await requestJson(baseUrl, '/files/private')).status, 401)
  assert.equal((await requestJson(baseUrl, '/file-picker/sources')).status, 401)
  console.log('PASS unauthenticated /files/private & /file-picker/sources rejected (401)')

  const login = await loginAccount(baseUrl, 'student.demo')
  const { folderId, uploadedFileId, initialUsedBytes } =
    await verifyPrivateFoldersAndUpload(baseUrl, login.headers)

  const picker = await requestJson<{
    repositories: Array<{ id: string }>
    uploadDefaults: { author: string }
    recentFiles: Array<{ id: string }>
    privateFiles: Array<{ name: string }>
    wikimediaResults: Array<{ title: string }>
  }>(baseUrl, '/file-picker/sources?q=OSI', { headers: login.headers })
  assert.equal(picker.status, 200)
  assert.equal(picker.body.data?.repositories.length, 4)
  assert.equal(picker.body.data?.uploadDefaults.author, 'Jordan Rivera')
  assert.ok(picker.body.data?.recentFiles.some((f) => f.id === uploadedFileId))
  assert.ok(picker.body.data?.privateFiles.some((p) => p.name === 'Wave7-Test-Folder'))
  assert.ok(picker.body.data?.wikimediaResults.some((w) => w.title.includes('OSI')))
  console.log('PASS GET /file-picker/sources (4 repositories, recent, private, wikimedia)')

  const [foreignFile] = await db
    .select({ id: fileObjects.id })
    .from(fileObjects)
    .where(eq(fileObjects.originalName, 'Module 1 - Introduction to Telecommunication Networks.pdf'))
    .limit(1)
  assert.ok(foreignFile)

  const forbiddenDelete = await requestJson(baseUrl, `/files/${foreignFile.id}`, {
    method: 'DELETE',
    headers: login.headers,
  })
  assert.equal(forbiddenDelete.status, 403)

  const deletedFolder = await requestJson<{
    kind: string
    quota: { usedBytes: number }
  }>(baseUrl, `/files/${folderId}`, { method: 'DELETE', headers: login.headers })
  assert.equal(deletedFolder.status, 200)
  assert.equal(deletedFolder.body.data?.kind, 'folder')
  assert.equal(deletedFolder.body.data?.quota.usedBytes, initialUsedBytes)
  console.log('PASS DELETE /files/:fileId (403 foreign guard & folder cascade cleanup)')

  await logoutAccount(baseUrl, login.headers)
})
