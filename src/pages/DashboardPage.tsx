import { PanelRightOpen } from 'lucide-react'
import { useRef, useState } from 'react'
import { CourseOverviewSection } from '../components/courses/CourseOverviewSection.tsx'
import { RecentlyAccessedSection } from '../components/courses/RecentlyAccessedSection.tsx'
import { DashboardHero } from '../components/dashboard/DashboardHero.tsx'
import { TimelineSection } from '../components/dashboard/TimelineSection.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { WorkspaceUtilityDrawer } from '../components/widgets/WorkspaceUtilityDrawer.tsx'
import { useDashboardTimeline } from '../hooks/useDashboardTimeline.ts'

import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const timeline = useDashboardTimeline()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  return (
    <AppShell>
      <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
        <button
          ref={triggerRef}
          type="button"
          className="sf-btn sf-btn--secondary motion-surface"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <PanelRightOpen size={18} aria-hidden="true" />
          <span>Clock, calendar & analytics</span>
        </button>
      </div>

      <DashboardHero
        priorityItem={timeline.priorityItem}
        timelineLoaded={timeline.priorityReady}
      />
      <TimelineSection
        filter={timeline.filter}
        sort={timeline.sort}
        searchInput={timeline.searchInput}
        items={timeline.items}
        total={timeline.total}
        hasMore={timeline.hasMore}
        loading={timeline.loading}
        loadingMore={timeline.loadingMore}
        error={timeline.error}
        onChangeFilter={timeline.applyFilter}
        onChangeSort={timeline.applySort}
        onChangeSearch={timeline.setSearchInput}
        onLoadMore={timeline.loadMore}
        onRetry={timeline.retry}
      />
      <CourseOverviewSection />
      <RecentlyAccessedSection />

      <WorkspaceUtilityDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          triggerRef.current?.focus()
        }}
      />
    </AppShell>
  )
}
