import '../components/categories/categories.css'
import '../components/reports/reports.css'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StaticGuideBody } from '../components/reports/StaticGuideBody.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { ThemeSwitch } from '../components/ui/ThemeSwitch.tsx'
import { useAuth } from '../context/authContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { ApiClientError } from '../services/apiClient.ts'
import { fetchStaticPage } from '../services/systemApi.ts'
import type { StaticPageDto } from '../types/workspace.ts'

export function StaticGuidePage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug ?? ''
  const [, setLocation] = useLocation()
  const { status } = useAuth()
  const [reloadSeq, setReloadSeq] = useState(0)
  const [state, setState] = useState<{
    key: string
    data: StaticPageDto | null
    error: string | null
    statusCode: number | null
  }>({ key: '__init__', data: null, error: null, statusCode: null })

  const activeKey = `${slug}::${reloadSeq}`
  const isLoading = state.key !== activeKey

  useDocumentTitle(state.data ? state.data.title : 'SilverFour guide')

  useEffect(() => {
    if (!slug) return
    const controller = new AbortController()
    fetchStaticPage(slug, controller.signal).then(
      (data) => setState({ key: activeKey, data, error: null, statusCode: 200 }),
      (err: unknown) => {
        if (controller.signal.aborted) return
        setState({
          key: activeKey,
          data: null,
          error: err instanceof Error ? err.message : 'Unable to load guide page',
          statusCode: err instanceof ApiClientError ? err.statusCode : null,
        })
      },
    )
    return () => controller.abort()
  }, [activeKey, slug])

  const content = isLoading ? (
    <StatusBanner variant="loading" title="Loading guide content" skeletonLines={4} />
  ) : state.statusCode === 401 ? (
    <StatusBanner
      variant="info"
      title="Sign in required"
      message="This internal guide page is only available to signed-in SilverFour users."
      actionLabel="Go to sign in"
      onAction={() => setLocation(`/login?redirect=${encodeURIComponent(`/static/${slug}`)}`)}
    />
  ) : state.error || !state.data ? (
    <StatusBanner
      variant="error"
      title="Guide page unavailable"
      message={state.error ?? 'The requested guide page does not exist.'}
      actionLabel="Retry"
      onAction={() => setReloadSeq((prev) => prev + 1)}
    />
  ) : (
    <StaticGuideBody slug={slug} page={state.data} />
  )

  if (status === 'authenticated') {
    return <AppShell>{content}</AppShell>
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="sf-surface" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
        <div className="sf-container sf-row" style={{ justifyContent: 'space-between', paddingBlock: 'var(--space-3)' }}>
          <Link href="/login" className="sf-row" style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--text-primary)' }}>
            <img src="/favicon.svg" alt="" width={24} height={24} aria-hidden="true" />
            <span>SilverFour</span>
          </Link>
          <div className="sf-row">
            <ThemeSwitch />
            <Link href="/login" className="sf-btn sf-btn--primary">Sign in</Link>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="sf-container sf-stack" style={{ flex: 1, paddingBlock: 'var(--space-5)' }}>
        {content}
      </main>
    </div>
  )
}
