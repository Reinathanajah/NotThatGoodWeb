import type { EmailVisibility, SupportedLang } from '../../types/auth.ts'

interface ProfilePreferenceSelectsProps {
  timezone: string
  preferredLang: SupportedLang
  emailVisibility: EmailVisibility
  tzOptions: readonly string[]
  onTimezoneChange: (val: string) => void
  onLangChange: (val: SupportedLang) => void
  onEmailVisibilityChange: (val: EmailVisibility) => void
}

export function ProfilePreferenceSelects({
  timezone,
  preferredLang,
  emailVisibility,
  tzOptions,
  onTimezoneChange,
  onLangChange,
  onEmailVisibilityChange,
}: ProfilePreferenceSelectsProps) {
  return (
    <div className="sf-row">
      <div className="foundation-field" style={{ flex: '1 1 200px' }}>
        <label htmlFor="prof-tz">Timezone</label>
        <select id="prof-tz" className="dash-select" value={timezone} onChange={(e) => onTimezoneChange(e.target.value)}>
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
          onChange={(e) => onLangChange(e.target.value as SupportedLang)}
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
          onChange={(e) => onEmailVisibilityChange(e.target.value as EmailVisibility)}
        >
          <option value="hidden">Hide my email address</option>
          <option value="course_participants">Allow course participants</option>
          <option value="everyone">Visible to everyone</option>
        </select>
      </div>
    </div>
  )
}
