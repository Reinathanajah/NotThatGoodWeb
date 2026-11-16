import { ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CourseOverviewSection } from '../components/courses/CourseOverviewSection.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { useI18n } from '../context/i18nContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { fetchNavigationMenus } from '../services/navigationApi.ts'
import type { NavigationItemDto } from '../types/navigation.ts'

export function MyCoursesPage() {
  useDocumentTitle('My courses')
  const { strings } = useI18n()
  const [announcements, setAnnouncements] = useState<NavigationItemDto[]>([])

  useEffect(() => {
    const controller = new AbortController()
    fetchNavigationMenus(controller.signal).then(
      (res) => {
        setAnnouncements(res.announcements.filter((item) => item.isHighlightedForRole))
      },
      () => {},
    )
    return () => controller.abort()
  }, [])

  return (
    <AppShell>
      <header className="sf-stack" style={{ gap: 'var(--space-2)' }}>
        <h1 className="sf-heading-display">{strings.nav.myCourses}</h1>
        {announcements.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noreferrer noopener' : undefined}
            className="status-banner status-banner--info"
            style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
          >
            <span className="status-banner-title">{item.label}</span>
            {item.isExternal ? <ExternalLink size={18} aria-hidden="true" /> : null}
          </a>
        ))}
      </header>

      <CourseOverviewSection />
    </AppShell>
  )
}
