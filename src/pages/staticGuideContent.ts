export interface GuideSectionEntry {
  id: string
  title: string
  summary: string
  steps: string[]
}

export const STATIC_GUIDE_SECTIONS: Record<string, GuideSectionEntry[]> = {
  platform_guides: [
    {
      id: 'getting-started',
      title: 'Tutorial 01: Sign In and Set Up Profile',
      summary: 'Configure your SilverFour workspace language, theme polarity, and security settings.',
      steps: [
        'Sign in with your university username or institutional email.',
        'Open Profile settings from the user menu to update display language and preferred theme.',
        'Link the mobile QR token or review active browser sessions on the security tab.',
      ],
    },
    {
      id: 'create-course',
      title: 'Tutorial 02: Managing Course Enrollments and Grades',
      summary: 'Browse active courses, inspect deadlines in Calendar, and monitor published grades.',
      steps: [
        'Use Categories Explorer or Search to locate courses across academic terms.',
        'Star priority courses on your Dashboard so they stay pinned in the overview filter.',
        'Open Grades from the top navigation or any course header to review feedback and weights.',
      ],
    },
    {
      id: 'course-layout',
      title: 'Tutorial 03: Organizing Course Sections and Resources',
      summary: 'Navigate structured sections, resource downloads, assignments, and timed quizzes.',
      steps: [
        'Expand or collapse weekly topic sections inside each course workspace.',
        'Mark manual learning items complete or track automatic quiz and submission completion.',
        'Review plagiarism scan percentages before finalizing assignment submissions.',
      ],
    },
    {
      id: 'instructor',
      title: 'Instructor Quick Reference',
      summary: 'Core tools for teaching staff managing SilverFour courses.',
      steps: [
        'Review student submission status, draft integrity scores, and grading queues.',
        'Monitor topic mastery using Quiz Tagging Analytics under Learning analytics.',
      ],
    },
    {
      id: 'student',
      title: 'Student Quick Reference',
      summary: 'Essential workflow for submitting coursework and reviewing scores.',
      steps: [
        'Upload drafts from your device or Private Files vault in Assignment Edit.',
        'Track upcoming quiz cut-offs and assignment due dates inside Calendar.',
      ],
    },
    {
      id: 'helpdesk',
      title: 'Helpdesk and Support Desk',
      summary: 'Reach support@silverfour.edu or open the Helpdesk drawer from any page.',
      steps: [
        'Submit a ticket using the bottom-right Support drawer for account or course access issues.',
        'Include the course code or assignment URL so support staff can triage promptly.',
      ],
    },
  ],
}
