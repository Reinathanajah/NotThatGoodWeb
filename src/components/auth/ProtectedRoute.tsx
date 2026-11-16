import type { ReactNode } from 'react'
import { Redirect, useSearch } from 'wouter'
import { useAuth } from '../../context/authContextValue.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth()
  const search = useSearch()

  if (status === 'checking') {
    return (
      <main id="main-content" tabIndex={-1} className="sf-container" style={{ paddingBlock: '3rem' }}>
        <StatusBanner
          variant="loading"
          title="Verifying session"
          message="Checking your active SilverFour session status."
          skeletonLines={3}
        />
      </main>
    )
  }

  if (status === 'guest') {
    const cleanSearch = search.replace(/^\?/, '')
    const currentPath = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ''}`
    const target = `/login?redirect=${encodeURIComponent(currentPath)}`
    return <Redirect to={target} replace />
  }

  return <>{children}</>
}
