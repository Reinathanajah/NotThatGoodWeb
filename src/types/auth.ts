import type { CategorySummaryDto } from './api.ts'

export type UserRole = 'student' | 'lecturer' | 'admin'
export type EmailVisibility = 'hidden' | 'course_participants' | 'everyone'
export type SupportedLang = 'en' | 'id' | 'zh_cn'

export interface UserPreferencesDto {
  editMode: boolean
  courseOverviewFilter: 'all' | 'in_progress' | 'future' | 'past' | 'starred' | 'hidden'
  courseOverviewSort: 'name' | 'last_accessed'
  courseOverviewView: 'list' | 'card' | 'summary'
  courseOverviewPageSize: 0 | 12 | 24 | 48
  calendarHiddenScopes: string[]
}

export interface LoginActivityDto {
  firstAccessAt: string | null
  lastAccessAt: string | null
  accountAgeSeconds: number | null
  secondsSinceLastAccess: number | null
}

export interface StorageQuotaDto {
  quotaBytes: number
  usedBytes: number
  remainingBytes: number
}

export interface AuthUserProfile {
  id: string
  username: string
  email: string
  fullName: string
  role: UserRole
  studentIdNumber: string | null
  facultyCategoryId: number | null
  programCategoryId: number | null
  emailVisibility: EmailVisibility
  country: string
  city: string
  timezone: string
  preferredLang: SupportedLang
  privateFilesQuotaBytes: number
  firstAccessAt: string | null
  lastAccessAt: string | null
  faculty: CategorySummaryDto | null
  program: CategorySummaryDto | null
  loginActivity: LoginActivityDto
  storage: StorageQuotaDto
  preferences: UserPreferencesDto
}

export interface LoginResult {
  accessToken: string
  tokenType: string
  expiresAt: string
  sessionId: string
  user: AuthUserProfile
}

export interface BrowserSessionDto {
  id: string
  userAgent: string | null
  ipAddress: string | null
  lastActiveAt: string
  expiresAt: string
  revokedAt: string | null
  createdAt: string
  isCurrent: boolean
  isActive: boolean
}

export interface ForgotPasswordResult {
  accepted: boolean
  message: string
  devResetToken?: string
  expiresAt?: string
}

export interface MobileQrTokenDto {
  qrToken: string
  qrUri: string
  expiresAt: string
}

export interface UpdateProfileInput {
  fullName?: string
  emailVisibility?: EmailVisibility
  country?: string
  city?: string
  timezone?: string
  preferredLang?: SupportedLang
}

export interface UpdatePreferencesInput {
  editMode?: boolean
  courseOverviewFilter?: UserPreferencesDto['courseOverviewFilter']
  courseOverviewSort?: UserPreferencesDto['courseOverviewSort']
  courseOverviewView?: UserPreferencesDto['courseOverviewView']
  courseOverviewPageSize?: UserPreferencesDto['courseOverviewPageSize']
  calendarHiddenScopes?: string[]
  resetToDefault?: boolean
}
