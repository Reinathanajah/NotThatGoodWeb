import { useCallback, useEffect, useState } from 'react'
import { fetchPrivateFiles } from '../services/filesApi.ts'
import type { PrivateFileEntryDto, PrivateFilesListingDto } from '../types/files.ts'
import { usePrivateFileActions } from './usePrivateFileActions.ts'

export type PrivateViewMode = 'list' | 'grid' | 'tree'

export function usePrivateFiles() {
  const [view, setView] = useState<PrivateViewMode>('list')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [listing, setListing] = useState<PrivateFilesListingDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inspectedEntry, setInspectedEntry] = useState<PrivateFileEntryDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PrivateFileEntryDto | null>(null)
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => {
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchPrivateFiles(view, view === 'tree' ? null : folderId, controller.signal).then(
      (res) => {
        if (controller.signal.aborted) return
        setListing(res)
        setError(null)
        setLoading(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Unable to load private files')
        setLoading(false)
      },
    )
    return () => controller.abort()
  }, [view, folderId, nonce])

  const maxUploadFileBytes = listing?.quota.maxUploadFileBytes ?? 104_857_600
  const actions = usePrivateFileActions(folderId, maxUploadFileBytes, refresh)

  const changeView = useCallback((nextView: PrivateViewMode) => {
    setView(nextView)
    if (nextView === 'tree') setFolderId(null)
  }, [])

  const openFolder = useCallback((nextFolderId: string | null) => {
    setFolderId(nextFolderId)
    setView((prev) => (prev === 'tree' ? 'list' : prev))
  }, [])

  const confirmDelete = useCallback(
    async (unlinkOnly = false) => {
      if (!deleteTarget) return
      const deletedId = deleteTarget.id
      const ok = await actions.deleteEntry(deleteTarget, unlinkOnly)
      if (ok) {
        setDeleteTarget(null)
        if (inspectedEntry?.id === deletedId) setInspectedEntry(null)
      }
    },
    [deleteTarget, actions, inspectedEntry],
  )

  return {
    view,
    folderId,
    listing,
    loading,
    error,
    inspectedEntry,
    deleteTarget,
    actions,
    setView: changeView,
    openFolder,
    refresh,
    retry: () => {
      setLoading(true)
      setError(null)
      refresh()
    },
    inspectEntry: (entry: PrivateFileEntryDto) => setInspectedEntry(entry),
    closeInspect: () => setInspectedEntry(null),
    requestDelete: (entry: PrivateFileEntryDto) => {
      actions.setDeleteConflict(null)
      setDeleteTarget(entry)
    },
    closeDelete: () => {
      actions.setDeleteConflict(null)
      setDeleteTarget(null)
    },
    confirmDelete,
  }
}
