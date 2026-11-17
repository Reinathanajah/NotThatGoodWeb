import '../components/categories/categories.css'
import '../components/resources/resources.css'
import '../components/assignments/assignments.css'
import '../components/files/privateFiles.css'
import '../components/comms/comms.css'
import { UserCheck } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell.tsx'
import { BrowserSessionsCard } from '../components/profile/BrowserSessionsCard.tsx'
import { MobileQrCard } from '../components/profile/MobileQrCard.tsx'
import { ProfileEditForm } from '../components/profile/ProfileEditForm.tsx'
import { StatusBanner } from '../components/ui/StatusBanner.tsx'
import { useAuth } from '../context/authContextValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'

export function UserProfilePage() {
  useDocumentTitle('Profile & security')
  const { user, refreshProfile } = useAuth()

  return (
    <AppShell>
      <header className="sf-surface cat-header-card sf-stack">
        <h1 className="sf-heading-display sf-row">
          <UserCheck size={28} color="var(--accent)" aria-hidden="true" />
          <span>{user?.fullName ?? 'User profile'}</span>
        </h1>
        <p className="sf-text-muted">Manage your academic profile, localization, browser sessions, and mobile pairing.</p>
      </header>

      {!user ? (
        <StatusBanner variant="loading" title="Loading user profile" skeletonLines={5} />
      ) : (
        <div className="profile-grid">
          <ProfileEditForm user={user} onUpdated={refreshProfile} />
          <div className="sf-stack">
            <BrowserSessionsCard timeZone={user.timezone} />
            <MobileQrCard />
          </div>
        </div>
      )}
    </AppShell>
  )
}
