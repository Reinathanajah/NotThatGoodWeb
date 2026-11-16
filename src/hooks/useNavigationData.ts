import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/authContextValue.ts'
import {
  fetchCategoryTree,
  fetchNavigationMenus,
  fetchUnreadBadgeCount,
  updateMyPreferences,
} from '../services/navigationApi.ts'
import type { CategoryNodeDto, NavigationMenusDto } from '../types/navigation.ts'

export function useNavigationData() {
  const { user, status, refreshProfile } = useAuth()
  const [menus, setMenus] = useState<NavigationMenusDto | null>(null)
  const [facultyTree, setFacultyTree] = useState<CategoryNodeDto[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [togglingEdit, setTogglingEdit] = useState(false)

  const editMode = user?.preferences.editMode ?? false

  useEffect(() => {
    if (status !== 'authenticated') return
    const controller = new AbortController()

    Promise.allSettled([
      fetchNavigationMenus(controller.signal),
      fetchCategoryTree(2, controller.signal),
      fetchUnreadBadgeCount(controller.signal),
    ]).then(([menusRes, treeRes, notifRes]) => {
      if (controller.signal.aborted) return
      if (menusRes.status === 'fulfilled') setMenus(menusRes.value)
      if (treeRes.status === 'fulfilled') setFacultyTree(treeRes.value)
      if (notifRes.status === 'fulfilled') setUnreadCount(notifRes.value.unreadCount)
    })

    return () => controller.abort()
  }, [status])

  const toggleEditMode = useCallback(async () => {
    if (togglingEdit) return
    setTogglingEdit(true)
    try {
      await updateMyPreferences({ editMode: !editMode })
      await refreshProfile()
    } finally {
      setTogglingEdit(false)
    }
  }, [editMode, refreshProfile, togglingEdit])

  return {
    menus,
    facultyTree,
    unreadCount,
    editMode,
    togglingEdit,
    toggleEditMode,
  }
}
