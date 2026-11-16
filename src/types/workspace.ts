export interface NotificationItemDto {
  id: string
  type: string
  title: string
  body: string
  actionUrl: string | null
  isRead: boolean
  createdAt: string
  courseId: number | null
  courseTitle: string | null
}

export interface NotificationsListDto {
  items: NotificationItemDto[]
  unreadCount: number
}

export interface ConversationSummaryDto {
  id: string
  title: string | null
  isGroup: boolean
  createdAt: string
  participants: Array<{ id: string; fullName: string; role: string }>
  lastMessage: { id: string; body: string; createdAt: string; senderName: string } | null
}

export interface ChatMessageDto {
  id: string
  body: string
  createdAt: string
  sender: { id: string; fullName: string; role: string }
}

export interface StaticPageDto {
  slug: string
  title: string
  contentMarkdown: string
  links: Array<{ label: string; href: string; external?: boolean }>
  isPublic: boolean
  updatedAt: string
}

export interface SupportStatusDto {
  liveChat: {
    status: 'online' | 'offline'
    statusLabel: string
    provider: string
    serviceHours: string
    timezone: string
    offlineMessage: string
  }
  helpdesk: { name: string; email: string; locationUrl: string; guideUrl: string }
  accessibilityWidget: { enabled: boolean; features: string[] }
  viewer: { authenticated: boolean; role: string }
}

export interface SupportTicketDto {
  id: string
  referenceCode: string
  userId: string | null
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export interface ClockResponseDto {
  utcIso: string
  server: { timezone: string; offset: string; formatted: string }
  user: { timezone: string; offset: string; formatted: string }
  converted: { timezone: string; offset: string; formatted: string }
}

export interface PresenceStatusDto {
  onlineCount: number
  activeWindowSeconds: number
  sampledAt: string
}

export interface HealthPayloadDto {
  service: string
  wave: number
  activeWaves: number[]
  environment: string
  database: { ok: boolean; latencyMs: number }
  utcTime: string
}
