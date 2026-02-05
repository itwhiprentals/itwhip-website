// app/fleet/choe/types.ts
// TypeScript interfaces for Choé AI Fleet Admin

import type { ChoeAISettings } from '@prisma/client'

// Re-export Prisma types
export type { ChoeAISettings }
export type { ChoeAIConversation, ChoeAIMessage, ChoeAISecurityEvent, ChoeAIDailyStats } from '@prisma/client'

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ChoeStatsResponse {
  success: boolean
  data: {
    today: ChoeStatsSnapshot
    week: ChoeStatsSnapshot
    month: ChoeStatsSnapshot
    allTime: ChoeStatsSnapshot
  }
  liveMetrics: {
    activeSessions: number
    messagesLastHour: number
    currentCostToday: number
  }
  dailyStats?: DailyChartData[]
  toolUsage?: Record<string, number>
}

export interface ChoeStatsSnapshot {
  conversations: number
  completed: number
  abandoned: number
  messages: number
  tokens: number
  estimatedCost: number
  conversionRate: number
  avgMessagesPerConv: number
  avgResponseTimeMs: number
  bookingsGenerated: number
  revenueGenerated: number
}

export interface ChoeConversationListResponse {
  success: boolean
  data: ConversationSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ConversationSummary {
  id: string
  sessionId: string
  userId: string | null
  visitorId: string | null
  ipAddress: string
  isAuthenticated: boolean
  state: string
  messageCount: number
  location: string | null
  vehicleType: string | null
  outcome: ConversationOutcome | null
  totalTokens: number
  estimatedCost: number
  bookingId: string | null
  bookingValue: number | null
  startedAt: string
  lastActivityAt: string
  completedAt: string | null
  duration: number // seconds
}

export interface ConversationDetail extends ConversationSummary {
  messages: MessageDetail[]
  timeline: TimelineEvent[]
}

export interface MessageDetail {
  id: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed: number
  responseTimeMs: number | null
  searchPerformed: boolean
  vehiclesReturned: number
  createdAt: string
}

export interface TimelineEvent {
  timestamp: string
  event: string
  details?: string
}

// =============================================================================
// SECURITY TYPES
// =============================================================================

export interface ChoeSecurityResponse {
  success: boolean
  data: SecurityEventSummary[]
  stats: SecurityStats
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SecurityEventSummary {
  id: string
  eventType: SecurityEventType
  severity: SecuritySeverity
  ipAddress: string
  visitorId: string | null
  sessionId: string | null
  details: Record<string, unknown> | null
  blocked: boolean
  createdAt: string
}

export interface SecurityStats {
  today: {
    rateLimitHits: number
    botsBlocked: number
    promptInjections: number
    uniqueIPs: number
  }
  week: {
    rateLimitHits: number
    botsBlocked: number
    promptInjections: number
    uniqueIPs: number
  }
}

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type ConversationOutcome =
  | 'COMPLETED'     // User completed booking flow
  | 'ABANDONED'     // User left without completing
  | 'BLOCKED'       // Security blocked the session
  | 'CONVERTED'     // Anonymous user signed up

export type ConversationState =
  | 'INIT'
  | 'COLLECTING_LOCATION'
  | 'COLLECTING_DATES'
  | 'COLLECTING_VEHICLE'
  | 'CONFIRMING'
  | 'CHECKING_AUTH'
  | 'READY_FOR_PAYMENT'

export type SecurityEventType =
  | 'rate_limit'
  | 'bot_detected'
  | 'prompt_injection'
  | 'session_limit'
  | 'message_length'
  | 'suspicious_pattern'

export type SecuritySeverity =
  | 'INFO'
  | 'WARNING'
  | 'CRITICAL'

// =============================================================================
// SETTINGS TYPES
// =============================================================================

export interface SettingsUpdatePayload {
  // Model
  modelId?: string
  maxTokens?: number
  temperature?: number

  // Pricing
  serviceFeePercent?: number
  taxRateDefault?: number

  // Rate Limits - Authenticated
  messagesPerWindow?: number
  rateLimitWindowMins?: number
  dailyApiLimit?: number
  sessionMessageLimit?: number
  maxMessageLength?: number

  // Rate Limits - Anonymous
  anonymousTimeSeconds?: number
  anonymousMaxMessages?: number

  // Risk Thresholds
  highRiskThreshold?: number
  verificationThreshold?: number
  anonymousUserPoints?: number
  unverifiedUserPoints?: number
  highValuePoints?: number
  exoticVehiclePoints?: number

  // Personality
  brandName?: string
  enableEmojis?: boolean
  serviceRegions?: string[]
  suggestionChips?: Record<string, string[]>

  // Feature Flags
  enabled?: boolean
  weatherEnabled?: boolean
  riskAssessmentEnabled?: boolean
  anonymousAccessEnabled?: boolean
}

// =============================================================================
// CHART DATA TYPES
// =============================================================================

export interface DailyChartData {
  date: string
  conversations: number
  completed: number
  abandoned: number
  cost: number
  tokens: number
  bookings: number
  revenue: number
}

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
  dropoffRate: number
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface ConversationFilters {
  dateFrom?: string
  dateTo?: string
  outcome?: ConversationOutcome | 'all'
  isAuthenticated?: boolean | 'all'
  hasBooking?: boolean | 'all'
  search?: string
}

export interface SecurityFilters {
  dateFrom?: string
  dateTo?: string
  eventType?: SecurityEventType | 'all'
  severity?: SecuritySeverity | 'all'
  blocked?: boolean | 'all'
  search?: string
}

// =============================================================================
// TOOL USAGE TYPES
// =============================================================================

export type ToolName =
  | 'search_vehicles'
  | 'get_weather'
  | 'select_vehicle'
  | 'update_booking_details'

export interface ToolUsageStats {
  toolName: ToolName
  callCount: number
  avgResponseTimeMs: number
  successRate: number
}

// =============================================================================
// BATCH ANALYTICS TYPES
// =============================================================================

export type BatchJobType = 'summary' | 'quality' | 'training'
export type BatchJobStatus = 'in_progress' | 'ended' | 'canceling' | 'canceled' | 'expired'

export interface BatchJobSummary {
  id: string
  type: BatchJobType
  status: BatchJobStatus
  conversationCount: number
  requestCount: number
  createdAt: string
  endedAt: string | null
  processingStatus: {
    succeeded: number
    errored: number
    expired: number
    canceled: number
  }
  costSavings: number
}

// =============================================================================
// STREAMING & VEHICLE TYPE METRICS
// =============================================================================

export interface StreamingMetrics {
  streamingSessions: number
  legacySessions: number
  streamingPercentage: number
}

export type VehicleTypeFilter = 'RENTAL' | 'RIDESHARE' | 'ALL'

export interface VehicleTypeStats {
  vehicleType: 'RENTAL' | 'RIDESHARE'
  searchCount: number
  selectionCount: number
  conversionRate: number
}

// =============================================================================
// EXTENDED SETTINGS (with new feature flags)
// =============================================================================

export interface ExtendedSettingsPayload extends SettingsUpdatePayload {
  // Advanced AI Features
  streamingEnabled?: boolean
  extendedThinkingEnabled?: boolean
  toolUseEnabled?: boolean
  batchAnalyticsEnabled?: boolean

  // Vehicle Type Preferences
  preferRideshare?: boolean
  preferNoDeposit?: boolean
  showVehicleTypeBadges?: boolean
}
