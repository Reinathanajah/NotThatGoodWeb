import assert from 'node:assert/strict'
import { type JsonEnvelope, requestJson } from '../helpers/http.js'

export async function verifyPrivateFoldersAndUpload(
  baseUrl: string,
  authHeaders: Record<string, string>,
): Promise<{ folderId: string; uploadedFileId: string; initialUsedBytes: number }> {
  const rootPrivate = await requestJson<{
    quota: { quotaBytes: number; usedBytes: number }
    entries: Array<{ id: string; isFolder: boolean; name: string }>
  }>(baseUrl, '/files/private', { headers: authHeaders })
  assert.equal(rootPrivate.status, 200)
  assert.equal(rootPrivate.body.data?.quota.quotaBytes, 2_147_483_648)
  const initialUsedBytes = rootPrivate.body.data!.quota.usedBytes
  const semesterFolder = rootPrivate.body.data!.entries.find(
    (e) => e.isFolder && e.name === 'Semester 3',
  )!
  assert.ok(semesterFolder)

  const nestedPrivate = await requestJson<{
    breadcrumbs: Array<{ name: string }>
    entries: Array<{ name: string }>
  }>(baseUrl, `/files/private?folderId=${semesterFolder.id}`, { headers: authHeaders })
  assert.equal(nestedPrivate.status, 200)
  assert.equal(nestedPrivate.body.data?.breadcrumbs[0]?.name, 'Semester 3')
  assert.ok(nestedPrivate.body.data?.entries.some((e) => e.name === 'Lab_Notes_Networks.pdf'))
  console.log('PASS GET /files/private (2 GB quota & folder breadcrumbs)')

  const badFolder = await requestJson(baseUrl, '/files/private/folders', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'bad/folder' }),
  })
  assert.equal(badFolder.status, 400)

  const createdFolder = await requestJson<{ id: string }>(
    baseUrl,
    '/files/private/folders',
    {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: 'Wave7-Test-Folder' }),
    },
  )
  assert.equal(createdFolder.status, 201)
  const folderId = createdFolder.body.data!.id

  const dupFolder = await requestJson(baseUrl, '/files/private/folders', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Wave7-Test-Folder' }),
  })
  assert.equal(dupFolder.status, 409)
  console.log('PASS POST /files/private/folders (create, validation 400, conflict 409)')

  const emptyForm = new FormData()
  emptyForm.append('saveAs', 'missing.txt')
  const missingUploadRes = await fetch(`${baseUrl}/files/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: emptyForm,
  })
  assert.equal(missingUploadRes.status, 400)

  const payloadText = 'Wave 7 verification file payload for SilverFour Private Files.'
  const form = new FormData()
  form.append('file', new Blob([payloadText], { type: 'text/plain' }), 'original-notes.txt')
  form.append('saveAs', 'Module07_Group04_StudentDemo.txt')
  form.append('license', 'cc_by')
  form.append('target', 'private')
  form.append('parentFolderId', folderId)

  const uploadRes = await fetch(`${baseUrl}/files/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: form,
  })
  assert.equal(uploadRes.status, 201)
  const uploadBody = (await uploadRes.json()) as JsonEnvelope<{
    file: { id: string; displayName: string; license: string }
    quota: { usedBytes: number }
  }>
  const uploadedFileId = uploadBody.data!.file.id
  assert.equal(uploadBody.data?.file.displayName, 'Module07_Group04_StudentDemo.txt')
  assert.equal(uploadBody.data?.file.license, 'cc_by')
  assert.equal(uploadBody.data?.quota.usedBytes, initialUsedBytes + Buffer.byteLength(payloadText))
  console.log('PASS POST /files/upload (multipart saved to disk & quota updated)')

  const downloadRes = await fetch(`${baseUrl}/files/${uploadedFileId}/download`, {
    headers: authHeaders,
  })
  assert.equal(downloadRes.status, 200)
  assert.equal(await downloadRes.text(), payloadText)
  console.log('PASS GET /files/:fileId/download (byte-for-byte match)')

  return { folderId, uploadedFileId, initialUsedBytes }
}
