import { useCallback, useState } from 'react'
import { formatBytes } from '../lib/formatBytes.ts'
import { ApiClientError } from '../services/apiClient.ts'
import {
  createPrivateFolder,
  deletePrivateFileOrFolder,
  downloadPrivateFile,
  uploadFileMultipart,
} from '../services/filesApi.ts'
import type { PrivateFileEntryDto } from '../types/files.ts'

export function usePrivateFileActions(
  folderId: string | null,
  maxUploadFileBytes: number,
  refresh: () => void,
) {
  const [actionError, setActionError] = useState<string | null>(null)
  const [folderError, setFolderError] = useState<string | null>(null)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConflict, setDeleteConflict] = useState<string | null>(null)

  const createFolder = useCallback(
    async (rawName: string): Promise<boolean> => {
      const name = rawName.trim()
      if (!name) {
        setFolderError('Enter a folder name.')
        return false
      }
      if (name.includes('/') || name.includes('\\')) {
        setFolderError('Folder name cannot contain / or \\ path separators.')
        return false
      }
      setFolderError(null)
      setCreatingFolder(true)
      try {
        await createPrivateFolder(name, folderId)
        refresh()
        return true
      } catch (err: unknown) {
        setFolderError(err instanceof Error ? err.message : 'Unable to create folder')
        return false
      } finally {
        setCreatingFolder(false)
      }
    },
    [folderId, refresh],
  )

  const uploadFiles = useCallback(
    async (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return
      setActionError(null)
      const list = Array.from(incoming)
      for (const item of list) {
        if (item.size > maxUploadFileBytes) {
          setActionError(`"${item.name}" exceeds the ${formatBytes(maxUploadFileBytes)} per-file limit.`)
          return
        }
      }
      setUploading(true)
      try {
        for (const item of list) {
          await uploadFileMultipart({
            file: item,
            filename: item.name,
            license: 'all_rights_reserved',
            target: 'private',
            parentFolderId: folderId ?? undefined,
          })
        }
        refresh()
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [folderId, maxUploadFileBytes, refresh],
  )

  const deleteEntry = useCallback(
    async (entry: PrivateFileEntryDto, unlinkOnly: boolean): Promise<boolean> => {
      const targetId = entry.isFolder || unlinkOnly ? entry.id : (entry.file?.id ?? entry.id)
      setDeleting(true)
      setDeleteConflict(null)
      try {
        await deletePrivateFileOrFolder(targetId)
        refresh()
        return true
      } catch (err: unknown) {
        if (err instanceof ApiClientError && err.statusCode === 409) {
          setDeleteConflict(err.message)
          return false
        }
        setDeleteConflict(err instanceof Error ? err.message : 'Delete failed')
        return false
      } finally {
        setDeleting(false)
      }
    },
    [refresh],
  )

  const downloadFile = useCallback(async (fileId: string, name: string) => {
    setDownloadingId(fileId)
    setActionError(null)
    try {
      await downloadPrivateFile(fileId, name)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }, [])

  return {
    actionError,
    folderError,
    creatingFolder,
    uploading,
    downloadingId,
    deleting,
    deleteConflict,
    setFolderError,
    setDeleteConflict,
    createFolder,
    uploadFiles,
    deleteEntry,
    downloadFile,
  }
}
