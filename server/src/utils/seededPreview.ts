function escapePdfText(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, ' ').replace(/[\\()]/g, '\\$&')
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Build a valid single-page PDF 1.4 document for seeded course resource previews. */
export function buildValidSeededPdf(originalName: string, displayName: string): Buffer {
  const safeTitle = escapePdfText(displayName).slice(0, 72)
  const safeFile = escapePdfText(originalName).slice(0, 76)
  const streamBody = [
    'BT',
    '/F1 18 Tf',
    '54 730 Td',
    `(${safeTitle}) Tj`,
    '0 -28 Td',
    '/F1 11 Tf',
    '(SilverFour Learning Management System - Course Resource Preview) Tj',
    '0 -22 Td',
    `(File: ${safeFile}) Tj`,
    '0 -26 Td',
    '(This generated 1-page PDF represents the seeded lecture/slides attachment.) Tj',
    '0 -18 Td',
    '(Upload or replace files in Private Files or Assignments to preview uploaded binaries.) Tj',
    'ET',
  ].join('\n')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamBody, 'utf8')} >>\nstream\n${streamBody}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += obj
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  return Buffer.from(pdf, 'utf8')
}

/** Build an isolated interactive HTML preview for seeded HTML simulation modules. */
export function buildSeededHtmlPreview(originalName: string, displayName: string): Buffer {
  const safeTitle = escapeHtml(displayName)
  const safeFile = escapeHtml(originalName)
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeTitle}</title>
<style>
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #0e1015; color: #f4f1ea; padding: 24px; line-height: 1.5; }
  .card { max-width: 720px; margin: 0 auto; background: #171a21; border: 1px solid #2b313e; border-radius: 12px; padding: 20px; }
  h1 { margin: 0 0 6px; font-size: 20px; }
  .meta { color: #b9b4aa; font-size: 14px; margin: 0 0 18px; }
  label { display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
  input[type=range] { width: 100%; accent-color: #d4940a; margin-bottom: 16px; }
  .bars { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
  .stat { background: #1f242e; border: 1px solid #2b313e; border-radius: 8px; padding: 12px; }
  .stat strong { display: block; font-size: 18px; color: #f4e8c1; font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
  <main class="card">
    <h1>${safeTitle}</h1>
    <p class="meta">Sandboxed interactive module (${safeFile})</p>
    <label for="w">Trade-off weight (&lambda;): <span id="w-val">0.50</span></label>
    <input id="w" type="range" min="0" max="100" value="50">
    <div class="bars">
      <div class="stat"><span>Primary residual ||Ax - b||</span><strong id="r1">0.707</strong></div>
      <div class="stat"><span>Regularization norm ||Fx - g||</span><strong id="r2">0.707</strong></div>
    </div>
  </main>
  <script>
    const slider = document.getElementById('w');
    const wVal = document.getElementById('w-val');
    const r1 = document.getElementById('r1');
    const r2 = document.getElementById('r2');
    slider.addEventListener('input', () => {
      const t = Number(slider.value) / 100;
      wVal.textContent = t.toFixed(2);
      r1.textContent = (0.35 + (1 - t) * 0.72).toFixed(3);
      r2.textContent = (0.35 + t * 0.72).toFixed(3);
    });
  </script>
</body>
</html>`
  return Buffer.from(html, 'utf8')
}
