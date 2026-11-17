import './app.css'
import { lazy, Suspense } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { ProtectedRoute } from './components/auth/ProtectedRoute.tsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx'
import { StatusBanner } from './components/ui/StatusBanner.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { I18nProvider } from './context/I18nProvider.tsx'
import { useDocumentTitle } from './hooks/useDocumentTitle.ts'

const LoginPage = lazy(() =>
  import('./pages/LoginPage.tsx').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage.tsx').then((m) => ({ default: m.DashboardPage })),
)
const MyCoursesPage = lazy(() =>
  import('./pages/MyCoursesPage.tsx').then((m) => ({ default: m.MyCoursesPage })),
)
const SearchPage = lazy(() =>
  import('./pages/SearchPage.tsx').then((m) => ({ default: m.SearchPage })),
)
const CategoryExplorerPage = lazy(() =>
  import('./pages/CategoryExplorerPage.tsx').then((m) => ({ default: m.CategoryExplorerPage })),
)
const CourseDetailPage = lazy(() =>
  import('./pages/CourseDetailPage.tsx').then((m) => ({ default: m.CourseDetailPage })),
)
const ResourceViewerPage = lazy(() =>
  import('./pages/ResourceViewerPage.tsx').then((m) => ({ default: m.ResourceViewerPage })),
)
const AssignmentDetailPage = lazy(() =>
  import('./pages/AssignmentDetailPage.tsx').then((m) => ({ default: m.AssignmentDetailPage })),
)
const AssignmentEditorPage = lazy(() =>
  import('./pages/AssignmentEditorPage.tsx').then((m) => ({ default: m.AssignmentEditorPage })),
)
const PrivateFilesPage = lazy(() =>
  import('./pages/PrivateFilesPage.tsx').then((m) => ({ default: m.PrivateFilesPage })),
)
const QuizPage = lazy(() =>
  import('./pages/QuizPage.tsx').then((m) => ({ default: m.QuizPage })),
)
const CalendarPage = lazy(() =>
  import('./pages/CalendarPage.tsx').then((m) => ({ default: m.CalendarPage })),
)
const NotificationsPage = lazy(() =>
  import('./pages/NotificationsPage.tsx').then((m) => ({ default: m.NotificationsPage })),
)
const MessagesPage = lazy(() =>
  import('./pages/MessagesPage.tsx').then((m) => ({ default: m.MessagesPage })),
)
const UserProfilePage = lazy(() =>
  import('./pages/UserProfilePage.tsx').then((m) => ({ default: m.UserProfilePage })),
)
const GradesOverviewPage = lazy(() =>
  import('./pages/GradesOverviewPage.tsx').then((m) => ({ default: m.GradesOverviewPage })),
)
const CourseGradebookPage = lazy(() =>
  import('./pages/CourseGradebookPage.tsx').then((m) => ({ default: m.CourseGradebookPage })),
)
const AnalyticsReportsPage = lazy(() =>
  import('./pages/AnalyticsReportsPage.tsx').then((m) => ({ default: m.AnalyticsReportsPage })),
)
const StaticGuidePage = lazy(() =>
  import('./pages/StaticGuidePage.tsx').then((m) => ({ default: m.StaticGuidePage })),
)

function RouteFallback() {
  return (
    <main id="main-content" tabIndex={-1} className="sf-container" style={{ paddingBlock: '3rem' }}>
      <StatusBanner variant="loading" title="Loading page" skeletonLines={3} />
    </main>
  )
}

function NotFoundView() {
  useDocumentTitle('Page not found')
  const [, setLocation] = useLocation()
  return (
    <main id="main-content" tabIndex={-1} className="sf-container" style={{ paddingBlock: '3rem' }}>
      <StatusBanner
        variant="empty"
        title="Page not found"
        message="The requested address could not be matched to an available workspace view."
        actionLabel="Return to dashboard"
        onAction={() => setLocation('/')}
      />
    </main>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <I18nProvider>
          <Suspense fallback={<RouteFallback />}>
            <Switch>
              <Route path="/login" component={LoginPage} />
              <Route path="/"><ProtectedRoute><DashboardPage /></ProtectedRoute></Route>
              <Route path="/my"><ProtectedRoute><DashboardPage /></ProtectedRoute></Route>
              <Route path="/my/"><ProtectedRoute><DashboardPage /></ProtectedRoute></Route>
              <Route path="/my/courses"><ProtectedRoute><MyCoursesPage /></ProtectedRoute></Route>
              <Route path="/search"><ProtectedRoute><SearchPage /></ProtectedRoute></Route>
              <Route path="/categories"><ProtectedRoute><CategoryExplorerPage /></ProtectedRoute></Route>
              <Route path="/categories/:id"><ProtectedRoute><CategoryExplorerPage /></ProtectedRoute></Route>
              <Route path="/courses/:id/grades"><ProtectedRoute><CourseGradebookPage /></ProtectedRoute></Route>
              <Route path="/courses/:id"><ProtectedRoute><CourseDetailPage /></ProtectedRoute></Route>
              <Route path="/resources/:moduleId"><ProtectedRoute><ResourceViewerPage /></ProtectedRoute></Route>
              <Route path="/assignments/:moduleId"><ProtectedRoute><AssignmentDetailPage /></ProtectedRoute></Route>
              <Route path="/assignments/:moduleId/edit"><ProtectedRoute><AssignmentEditorPage /></ProtectedRoute></Route>
              <Route path="/quizzes/:moduleId"><ProtectedRoute><QuizPage /></ProtectedRoute></Route>
              <Route path="/calendar"><ProtectedRoute><CalendarPage /></ProtectedRoute></Route>
              <Route path="/notifications"><ProtectedRoute><NotificationsPage /></ProtectedRoute></Route>
              <Route path="/messages"><ProtectedRoute><MessagesPage /></ProtectedRoute></Route>
              <Route path="/messages/:id"><ProtectedRoute><MessagesPage /></ProtectedRoute></Route>
              <Route path="/user/files"><ProtectedRoute><PrivateFilesPage /></ProtectedRoute></Route>
              <Route path="/user/profile"><ProtectedRoute><UserProfilePage /></ProtectedRoute></Route>
              <Route path="/grades"><ProtectedRoute><GradesOverviewPage /></ProtectedRoute></Route>
              <Route path="/reports/analytics"><ProtectedRoute><AnalyticsReportsPage /></ProtectedRoute></Route>
              <Route path="/reports/analytics/:key"><ProtectedRoute><AnalyticsReportsPage /></ProtectedRoute></Route>
              <Route path="/reports/learner-script"><ProtectedRoute><AnalyticsReportsPage /></ProtectedRoute></Route>
              <Route path="/reports/learner-script/:key"><ProtectedRoute><AnalyticsReportsPage /></ProtectedRoute></Route>
              <Route path="/static/:slug" component={StaticGuidePage} />
              <Route component={NotFoundView} />
            </Switch>
          </Suspense>
        </I18nProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
