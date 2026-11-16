import crypto from 'node:crypto'
import { env } from '../../config/env.js'

export interface PlagiarismSubmitInput {
  submissionId: string
  fileId: string
  filename: string
  mimeType: string
  sizeBytes: number
  sha256: string | null
}

export interface PlagiarismScanResult {
  externalDocumentId: string
  status: 'scanning' | 'completed'
  similarityPercent: string | null
  reportUrl: string
}

export interface PlagiarismScanner {
  readonly provider: string
  submitDocument(input: PlagiarismSubmitInput): Promise<PlagiarismScanResult>
}

class MockCompilatioScanner implements PlagiarismScanner {
  readonly provider = 'compilatio'

  async submitDocument(input: PlagiarismSubmitInput): Promise<PlagiarismScanResult> {
    const digest = crypto
      .createHash('sha256')
      .update(`${input.submissionId}:${input.fileId}:${input.sha256 ?? input.filename}`)
      .digest('hex')

    const externalDocumentId = `comp-mock-${digest.slice(0, 12)}`
    const deterministicScore = ((parseInt(digest.slice(0, 4), 16) % 180) / 10).toFixed(2)

    return {
      externalDocumentId,
      status: 'completed',
      similarityPercent: deterministicScore,
      reportUrl: `/api/v1/assignments/plagiarism/mock-report/${externalDocumentId}`,
    }
  }
}

export function getPlagiarismScanner(provider: string | null): PlagiarismScanner | null {
  if (provider !== 'compilatio') {
    return null
  }
  // When COMPILATIO_ENABLED=true in production, swap in the HTTP Compilatio client here.
  if (env.COMPILATIO_ENABLED) {
    return new MockCompilatioScanner()
  }
  return new MockCompilatioScanner()
}
