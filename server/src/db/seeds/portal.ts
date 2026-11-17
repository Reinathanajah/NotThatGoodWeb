import { count, sql } from 'drizzle-orm'
import { db } from '../index.js'
import { learnerScriptReports, navigationItems, staticPages } from '../schema.js'

export async function seedPortalAndNavigation() {
  const [{ value: existingNavCount }] = await db.select({ value: count() }).from(navigationItems)
  if (existingNavCount === 0) {
    await db.insert(navigationItems).values([
      { menuGroup: 'primary', label: 'Home', href: '/', sortOrder: 1 },
      { menuGroup: 'primary', label: 'Dashboard', href: '/my', sortOrder: 2 },
      { menuGroup: 'primary', label: 'My courses', href: '/my/courses', sortOrder: 3 },
      { menuGroup: 'portal_links', label: 'Course Archive', href: '/categories', isExternal: false, sortOrder: 1 },
      { menuGroup: 'guide_links', label: 'Role Guides', href: '/static/role_guides', sortOrder: 1 },
      { menuGroup: 'guide_links', label: 'Platform User Manual', href: '/static/platform_guides', isExternal: false, sortOrder: 2 },
      { menuGroup: 'external', label: 'Academic Portal', href: '/my', isExternal: false, sortOrder: 1 },
      {
        menuGroup: 'announcement',
        label: 'Course Creation & Enrollment Request (Instructors)',
        href: '/static/platform_guides#instructor',
        targetRole: 'lecturer',
        isExternal: false,
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
          { label: 'Teacher', href: '/static/platform_guides#instructor', isExternal: false },
          { label: 'Student', href: '/static/platform_guides#student', isExternal: false },
          { label: 'Quiz Tagging Analytics', href: '/reports/analytics/quiz-tagging', isExternal: false },
        ],
        isPublic: true,
      },
      {
        slug: 'privacy_summary',
        title: 'Data retention summary',
        contentMarkdown:
          'Summary of student academic record retention, session history, and coursework submissions under SilverFour platform policy.',
        linksJson: [
          { label: 'Cookies notice', href: '/static/cookies_notice', isExternal: false },
          { label: 'Platform User Guides', href: '/static/platform_guides', isExternal: false },
        ],
        isPublic: true,
      },
      {
        slug: 'cookies_notice',
        title: 'Cookies notice',
        contentMarkdown:
          'This platform uses essential authentication and language preference cookies to keep user sessions secure.',
        linksJson: [
          { label: 'Data retention summary', href: '/static/privacy_summary', isExternal: false },
        ],
        isPublic: true,
      },
      {
        slug: 'platform_guides',
        title: 'SilverFour User Guides',
        contentMarkdown: 'Official documentation and tutorials for instructors and learners using SilverFour.',
        linksJson: [
          { label: 'Tutorial 01: Sign In and Set Up Profile', href: '/static/platform_guides#getting-started', isExternal: false },
          { label: 'Tutorial 02: Creating a New Course', href: '/static/platform_guides#create-course', isExternal: false },
          { label: 'Tutorial 03: Organizing Course Sections', href: '/static/platform_guides#course-layout', isExternal: false },
        ],
        isPublic: true,
      },
    ])
    .onConflictDoUpdate({
      target: staticPages.slug,
      set: {
        title: sql`excluded.title`,
        contentMarkdown: sql`excluded.content_markdown`,
        linksJson: sql`excluded.links_json`,
      },
    })

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
