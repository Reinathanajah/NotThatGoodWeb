import { formatDateTimeShort } from '../../lib/dateFormat.ts'
import { formatBytes } from '../../lib/formatBytes.ts'
import type { AuthUserProfile } from '../../types/auth.ts'

export function ProfileActivitySummary({ user }: { user: AuthUserProfile }) {
  return (
    <dl className="foundation-meta tabular-nums">
      <div className="foundation-meta-row">
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </div>
      <div className="foundation-meta-row">
        <dt>Role & ID</dt>
        <dd>
          {user.role}
          {user.studentIdNumber ? ` · ${user.studentIdNumber}` : ''}
        </dd>
      </div>
      <div className="foundation-meta-row">
        <dt>First / Last access</dt>
        <dd>
          {user.firstAccessAt ? formatDateTimeShort(user.firstAccessAt, user.timezone) : '-'} /{' '}
          {user.lastAccessAt ? formatDateTimeShort(user.lastAccessAt, user.timezone) : '-'}
        </dd>
      </div>
      <div className="foundation-meta-row">
        <dt>Private files usage</dt>
        <dd>
          {formatBytes(user.storage.usedBytes)} / {formatBytes(user.storage.quotaBytes)}
        </dd>
      </div>
    </dl>
  )
}
