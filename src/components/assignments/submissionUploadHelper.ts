import { formatBytes } from '../../lib/formatBytes.ts'
import { uploadFileMultipart } from '../../services/filesApi.ts'
import type { StoredFileMetaDto } from '../../types/files.ts'

export async function validateAndUploadFiles(
  incoming: FileList,
  currentCount: number,
  maxFiles: number,
  maxFileSizeBytes: number,
  onUploaded: (file: StoredFileMetaDto) => void,
): Promise<string | null> {
  const list = Array.from(incoming)
  if (currentCount + list.length > maxFiles) {
    return `Cannot attach ${list.length} more files: limit is ${maxFiles} total.`
  }
  for (const item of list) {
    if (item.size > maxFileSizeBytes) {
      return `"${item.name}" exceeds the ${formatBytes(maxFileSizeBytes)} limit.`
    }
  }
  for (const item of list) {
    const res = await uploadFileMultipart({
      file: item,
      filename: item.name,
      license: 'all_rights_reserved',
      target: 'submission_draft',
    })
    onUploaded(res.file)
  }
  return null
}
