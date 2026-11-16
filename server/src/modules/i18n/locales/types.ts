export type SupportedLang = 'en' | 'id' | 'zh_cn'

export const AVAILABLE_LANGUAGES: Array<{ code: SupportedLang; label: string }> = [
  { code: 'en', label: 'English (en)' },
  { code: 'id', label: 'Bahasa Indonesia (id)' },
  { code: 'zh_cn', label: '简体中文 (zh_cn)' },
]

export interface I18nStrings {
  auth: {
    loginTitle: string
    usernamePlaceholder: string
    passwordPlaceholder: string
    loginButton: string
    lostPassword: string
    cookiesNotice: string
  }
  nav: {
    home: string
    dashboard: string
    myCourses: string
    facultyHomepage: string
    portalLinks: string
    guideLinks: string
    external: string
    editMode: string
  }
  dashboard: {
    title: string
    timeline: string
    courseOverview: string
    recentlyAccessed: string
    showMoreActivities: string
    timezoneClock: string
    learnerScript: string
    calendar: string
    overdueBadge: string
  }
  profile: {
    userDetails: string
    editProfile: string
    emailAddress: string
    country: string
    city: string
    timezone: string
    reports: string
    browserSessions: string
    gradesOverview: string
    loginActivity: string
    firstAccess: string
    lastAccess: string
    mobileApp: string
    resetPageToDefault: string
    languageSelector: string
  }
  assignment: {
    submissionStatusTitle: string
    attemptNumber: string
    submissionStatus: string
    gradingStatus: string
    timeRemaining: string
    lastModified: string
    submissionComments: string
    addSubmission: string
    saveChanges: string
    cancel: string
  }
  files: {
    privateFiles: string
    filePicker: string
    recentFiles: string
    uploadFile: string
    wikimedia: string
    saveAs: string
    author: string
    chooseLicence: string
  }
  calendar: {
    newEvent: string
    allCourses: string
    eventsKey: string
    hideSiteEvents: string
    hideCategoryEvents: string
    hideCourseEvents: string
    hideGroupEvents: string
    hideUserEvents: string
    hideOtherEvents: string
  }
  common: {
    onlineLabel: string
    search: string
    backToCourse: string
    dataRetentionSummary: string
    getMobileApp: string
  }
}
