import '../components/courses/courses.css'
import '../components/courses/courseDetail.css'
import { useLocation, useParams } from 'wouter'
import { CourseDetailHeader } from '../components/courses/CourseDetailHeader.tsx'
import { CourseIndexNav } from '../components/courses/CourseIndexNav.tsx'
import { CourseSectionAccordion } from '../components/courses/CourseSectionAccordion.tsx'
import { AppShell } from '../components/layout/AppShell.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useCourseDetail } from '../hooks/useCourseDetail.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export function CourseDetailPage() {
  const params = useParams<{ id?: string }>()
  const [, setLocation] = useLocation()
  const parsedId = Number(params.id)
  const courseId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0

  const detail = useCourseDetail(courseId)
  useDocumentTitle(
    detail.course ? `${detail.course.code} ${detail.course.title}` : 'Course view',
  )

  const handleJumpSection = (sectionId: number) => {
    detail.expandSection(sectionId)
    window.requestAnimationFrame(() => {
      document.getElementById(`course-sec-${sectionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <AppShell>
      {courseId === 0 ? (
        <StatusBanner
          variant="error"
          title="Invalid course identifier"
          message="Return to the directory or dashboard to open a valid course."
          actionLabel="Browse categories"
          onAction={() => setLocation('/categories/1')}
        />
      ) : detail.error ? (
        <StatusBanner
          variant="error"
          title={detail.error.status === 403 ? 'Enrollment required' : 'Could not load course'}
          message={
            detail.error.status === 403
              ? 'You are not enrolled in this course section yet. Open Course overview or browse available categories.'
              : detail.error.message
          }
          actionLabel={detail.error.status === 403 ? 'Browse categories' : 'Retry course'}
          onAction={
            detail.error.status === 403 ? () => setLocation('/categories/1') : detail.retry
          }
        />
      ) : detail.loading || !detail.course ? (
        <StatusBanner variant="loading" title="Loading course syllabus" skeletonLines={5} />
      ) : (
        <>
          {detail.actionError ? (
            <StatusBanner variant="error" title="Update failed" message={detail.actionError} />
          ) : null}

          <CourseDetailHeader
            course={detail.course}
            togglingStar={detail.togglingStar}
            onToggleStar={() => void detail.toggleStar()}
          />

          <div className="course-detail-layout">
            <CourseIndexNav
              sections={detail.course.sections}
              onJumpSection={handleJumpSection}
              onExpandAll={() => detail.setAllSectionsExpanded(true)}
              onCollapseAll={() => detail.setAllSectionsExpanded(false)}
            />

            <div className="sf-stack">
              {detail.course.sections.length === 0 ? (
                <StatusBanner
                  variant="empty"
                  title="No course sections published yet"
                  message="Check back later or return to your dashboard timeline for upcoming activities."
                />
              ) : (
                detail.course.sections.map((section) => (
                  <CourseSectionAccordion
                    key={section.id}
                    courseId={detail.course!.id}
                    section={section}
                    collapsed={detail.collapsedIds.has(section.id)}
                    pendingModules={detail.pendingModules}
                    onToggle={detail.toggleSection}
                    onToggleComplete={(modId, next) =>
                      void detail.toggleModuleCompletion(modId, next)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}
