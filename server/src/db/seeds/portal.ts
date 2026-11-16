import { count } from 'drizzle-orm'
import { db } from '../index.js'
import { learnerScriptReports, navigationItems, staticPages } from '../schema.js'

export async function seedPortalAndNavigation() {
  const [{ value: existingNavCount }] = await db.select({ value: count() }).from(navigationItems)
  if (existingNavCount === 0) {
    await db.insert(navigationItems).values([
      { menuGroup: 'primary', label: 'Home', href: '/', sortOrder: 1 },
      { menuGroup: 'primary', label: 'Dashboard', href: '/my', sortOrder: 2 },
      { menuGroup: 'primary', label: 'My courses', href: '/my/courses', sortOrder: 3 },
      { menuGroup: 'portal_links', label: 'Course Archive', href: 'https://archive.silverfour.edu/', isExternal: true, sortOrder: 1 },
      { menuGroup: 'guide_links', label: 'Role Guides', href: '/static/role_guides', sortOrder: 1 },
      {
        menuGroup: 'guide_links',
        label: 'Platform User Manual',
        href: 'https://guides.silverfour.edu/',
        isExternal: true,
        sortOrder: 2,
      },
      { menuGroup: 'external', label: 'Academic Portal', href: 'https://portal.silverfour.edu/', isExternal: true, sortOrder: 1 },
      {
        menuGroup: 'announcement',
        label: 'Course Creation & Enrollment Request (Instructors)',
        href: 'https://guides.silverfour.edu/instructors',
        targetRole: 'lecturer',
        isExternal: true,
        sortOrder: 1,
      },
    ])
  }

  await db
    .insert(staticPages)
    .values([
      {
        slug: 'role_guides',
        title: 'Role Guides',
        contentMarkdown: 'Select an instructor guide, student handbook, or learning analytics view for SilverFour.',
        linksJson: [
          { label: 'Teacher', href: 'https://guides.silverfour.edu/instructor', isExternal: true },
          { label: 'Student', href: 'https://guides.silverfour.edu/student', isExternal: true },
          { label: 'Quiz Tagging Analytics', href: '/reports/analytics/quiz-tagging', isExternal: false },
        ],
        isPublic: true,
      },
      {
        slug: 'privacy_summary',
        title: 'Data retention summary',
        contentMarkdown:
          'Summary of student academic record retention, session history, and coursework submissions under SilverFour platform policy.',
        linksJson: [],
        isPublic: true,
      },
      {
        slug: 'cookies_notice',
        title: 'Cookies notice',
        contentMarkdown:
          'This platform uses essential authentication and language preference cookies to keep user sessions secure.',
        linksJson: [],
        isPublic: true,
      },
      {
        slug: 'platform_guides',
        title: 'SilverFour User Guides',
        contentMarkdown: 'Official documentation and tutorials for instructors and learners using SilverFour.',
        linksJson: [
          { label: 'Tutorial 01: Sign In and Set Up Profile', href: 'https://guides.silverfour.edu/getting-started', isExternal: true },
          { label: 'Tutorial 02: Creating a New Course', href: 'https://guides.silverfour.edu/create-course', isExternal: true },
          { label: 'Tutorial 03: Organizing Course Sections', href: 'https://guides.silverfour.edu/course-layout', isExternal: true },
        ],
        isPublic: true,
      },
    ])
    .onConflictDoNothing({ target: staticPages.slug })

  await db
    .insert(learnerScriptReports)
    .values([
      {
        key: 'student-progress',
        title: 'Course progress analytics',
        description: 'Overview of module completion progress and learner activity across enrolled courses.',
        reportType: 'course_progress',
        configJson: { metrics: ['completion_rate', 'submissions_count', 'quiz_average'] },
      },
      {
        key: 'quiz-tagging',
        title: 'Quiz Tagging Analytics',
        description: 'Quiz performance breakdown grouped by question topic tags.',
        reportType: 'quiz_tags',
        configJson: { metrics: ['tag_accuracy', 'attempt_duration'] },
      },
    ])
    .onConflictDoNothing({ target: learnerScriptReports.key })
}
