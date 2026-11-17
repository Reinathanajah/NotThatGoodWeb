import { type FormEvent, useState } from 'react'
import { updateMyPreferences } from '../../services/navigationApi.ts'
import { updateMyProfile } from '../../services/usersApi.ts'
import type { AuthUserProfile, EmailVisibility, SupportedLang } from '../../types/auth.ts'
import { StatusBanner } from '../ui/StatusBanner.tsx'
import { ProfileActivitySummary } from './ProfileActivitySummary.tsx'
import { getTimezoneSelectOptions } from './timezoneOptions.ts'

interface ProfileEditFormProps {
  user: AuthUserProfile
  onUpdated: () => Promise<unknown>
}

export function ProfileEditForm({ user, onUpdated }: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(user.fullName)
  const [emailVisibility, setEmailVisibility] = useState<EmailVisibility>(user.emailVisibility)
  const [country, setCountry] = useState(user.country)
  const [city, setCity] = useState(user.city)
  const [timezone, setTimezone] = useState(user.timezone)
  const [preferredLang, setPreferredLang] = useState<SupportedLang>(user.preferredLang)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.')
      return
    }
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      await updateMyProfile({
        fullName: fullName.trim(),
        emailVisibility,
        country: country.trim(),
        city: city.trim(),
        timezone,
        preferredLang,
      })
      await onUpdated()
      setNotice('Profile settings saved.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleResetDefaults() {
    setResetting(true)
    setError(null)
    setNotice(null)
    try {
      await updateMyPreferences({ resetToDefault: true })
      await onUpdated()
      setNotice('Workspace layout and filter preferences reset to defaults.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to reset preferences')
    } finally {
      setResetting(false)
    }
  }

  const tzOptions = getTimezoneSelectOptions(timezone)

  return (
    <section className="sf-surface res-stage-card sf-stack" aria-labelledby="profile-form-heading">
      <div className="dash-controls">
        <h2 id="profile-form-heading" className="sf-heading-section">
          Account profile
        </h2>
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          disabled={resetting}
          onClick={() => void handleResetDefaults()}
        >
          {resetting ? 'Resetting...' : 'Reset page to default'}
        </button>
      </div>

      {error ? <StatusBanner variant="error" title="Update failed" message={error} /> : null}
      {notice ? <StatusBanner variant="success" title="Updated" message={notice} /> : null}

      <form className="sf-stack" onSubmit={handleSave}>
        <div className="foundation-field">
          <label htmlFor="prof-fullname">Full name</label>
          <input id="prof-fullname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="sf-row">
          <div className="foundation-field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="prof-city">City</label>
            <input id="prof-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="foundation-field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="prof-country">Country</label>
            <input id="prof-country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>

        <div className="sf-row">
          <div className="foundation-field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="prof-tz">Timezone</label>
            <select id="prof-tz" className="dash-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {tzOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="foundation-field" style={{ flex: '1 1 160px' }}>
            <label htmlFor="prof-lang">Language</label>
            <select
              id="prof-lang"
              className="dash-select"
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value as SupportedLang)}
            >
              <option value="en">English (en)</option>
              <option value="id">Indonesian (id)</option>
              <option value="zh_cn">Chinese Simplified (zh_cn)</option>
            </select>
          </div>
          <div className="foundation-field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="prof-email-vis">Email display</label>
            <select
              id="prof-email-vis"
              className="dash-select"
              value={emailVisibility}
              onChange={(e) => setEmailVisibility(e.target.value as EmailVisibility)}
            >
              <option value="hidden">Hide my email address</option>
              <option value="course_participants">Allow course participants</option>
              <option value="everyone">Visible to everyone</option>
            </select>
          </div>
        </div>

        <div className="sf-row" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="sf-btn sf-btn--primary" disabled={saving}>
            {saving ? 'Saving profile...' : 'Save profile'}
          </button>
        </div>
      </form>

      <ProfileActivitySummary user={user} />
    </section>
  )
}
