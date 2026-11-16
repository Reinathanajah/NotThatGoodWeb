import assert from 'node:assert/strict'
import { requestJson } from '../helpers/http.js'

export async function verifyResourcesAndDownloads(
  baseUrl: string,
  authHeaders: Record<string, string>,
  vizModuleId: number,
  simModuleId: number,
): Promise<void> {
  const vizDetail = await requestJson<{
    resourceKind: string
    file: { mimeType: string }
    navigation: { prev: { title: string } | null; next: { title: string } | null }
  }>(baseUrl, `/resources/${vizModuleId}`, { headers: authHeaders })
  assert.equal(vizDetail.status, 200)
  assert.equal(vizDetail.body.data?.resourceKind, 'pdf')
  assert.equal(vizDetail.body.data?.file.mimeType, 'application/pdf')
  assert.equal(
    vizDetail.body.data?.navigation.prev?.title,
    'Multiobjective Least Squares Assignment (Wednesday)',
  )
  assert.equal(vizDetail.body.data?.navigation.next?.title, 'Linear-Multiobj-LS-simulation')

  const wrongType = await requestJson(baseUrl, '/resources/3213297', { headers: authHeaders })
  assert.equal(wrongType.status, 404)

  const pdfDownload = await fetch(`${baseUrl}/resources/${vizModuleId}/download`, {
    headers: authHeaders,
  })
  assert.equal(pdfDownload.status, 200)
  assert.equal(pdfDownload.headers.get('content-type'), 'application/pdf')
  assert.ok(pdfDownload.headers.get('content-disposition')?.includes('attachment'))
  assert.ok((await pdfDownload.text()).startsWith('%PDF-1.4'))

  const htmlDownload = await fetch(
    `${baseUrl}/resources/${simModuleId}/download?disposition=inline`,
    { headers: authHeaders },
  )
  assert.equal(htmlDownload.status, 200)
  assert.ok(htmlDownload.headers.get('content-type')?.startsWith('text/html'))
  assert.equal(htmlDownload.headers.get('content-security-policy'), 'sandbox allow-scripts')
  assert.ok(htmlDownload.headers.get('content-disposition')?.includes('inline'))
  console.log('PASS GET /resources/:moduleId & /download (PDF + sandboxed HTML)')
}
