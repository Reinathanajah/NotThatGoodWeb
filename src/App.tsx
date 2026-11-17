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
const WorkspacePreviewPage = lazy(() =>
  import('./pages/WorkspacePreviewPage.tsx').then((m) => ({ default: m.WorkspacePreviewPage })),
)

const PLANNED_ROUTES = [
  { path: '/quizzes/:moduleId', title: 'Quiz module' },
  { path: '/notifications', title: 'Notifications' },
  { path: '/messages', title: 'Messages' },
  { path: '/calendar', title: 'Academic calendar' },
  { path: '/grades', title: 'Grades' },
  { path: '/reports/analytics', title: 'Learning analytics' },
  { path: '/reports/analytics/:key', title: 'Analytics detail' },
  { path: '/reports/learner-script', title: 'Learning analytics' },
  { path: '/reports/learner-script/:key', title: 'Analytics detail' },
  { path: '/user/files', title: 'Private files' },
  { path: '/user/profile', title: 'User profile' },
  { path: '/static/:slug', title: 'Guide page' },
] as const

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
              <Route path="/courses/:id"><ProtectedRoute><CourseDetailPage /></ProtectedRoute></Route>
              <Route path="/resources/:moduleId"><ProtectedRoute><ResourceViewerPage /></ProtectedRoute></Route>
              <Route path="/assignments/:moduleId"><ProtectedRoute><AssignmentDetailPage /></ProtectedRoute></Route>
              <Route path="/assignments/:moduleId/edit"><ProtectedRoute><AssignmentEditorPage /></ProtectedRoute></Route>
              {PLANNED_ROUTES.map((item) => (
                <Route key={item.path} path={item.path}>
                  <ProtectedRoute>
                    <WorkspacePreviewPage title={item.title} />
                  </ProtectedRoute>
                </Route>
              ))}
              <Route component={NotFoundView} />
            </Switch>
          </Suspense>
        </I18nProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
