export interface ResolvedGuideTarget {
  href: string
  isExternal: boolean
}

const GUIDE_URL_MAP: Record<string, string> = {
  'https://guides.silverfour.edu/': '/static/platform_guides',
  'https://guides.silverfour.edu': '/static/platform_guides',
  'https://guides.silverfour.edu/instructor': '/static/platform_guides#instructor',
  'https://guides.silverfour.edu/instructors': '/static/platform_guides#instructor',
  'https://guides.silverfour.edu/student': '/static/platform_guides#student',
  'https://guides.silverfour.edu/getting-started': '/static/platform_guides#getting-started',
  'https://guides.silverfour.edu/create-course': '/static/platform_guides#create-course',
  'https://guides.silverfour.edu/course-layout': '/static/platform_guides#course-layout',
  'https://helpdesk.silverfour.edu/': '/static/platform_guides#helpdesk',
  'https://helpdesk.silverfour.edu': '/static/platform_guides#helpdesk',
  'https://archive.silverfour.edu/': '/categories',
  'https://archive.silverfour.edu': '/categories',
  'https://portal.silverfour.edu/': '/my',
  'https://portal.silverfour.edu': '/my',
}

/** Map seeded portal URLs cleanly to working internal workspace routes. */
export function resolveGuideTarget(href: string, isExternal = false): ResolvedGuideTarget {
  const mapped = GUIDE_URL_MAP[href]
  if (mapped) {
    return { href: mapped, isExternal: false }
  }
  if (href.startsWith('/') || href.startsWith('#')) {
    return { href, isExternal: false }
  }
  return { href, isExternal }
}
