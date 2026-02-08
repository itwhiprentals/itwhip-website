// app/fleet/choe/constants.ts
// Constants for Choé AI Fleet Admin

// =============================================================================
// BRANDING
// =============================================================================

export const CHOE_BRAND = {
  name: 'Choé',
  pronunciation: 'show-AY',
  domain: 'choe.cloud',
  logoPath: '/images/choe-logo.png',
  tagline: 'AI-Powered Car Rental Assistant',
}

// =============================================================================
// COLORS
// =============================================================================

export const CHOE_COLORS = {
  primary: {
    from: 'from-purple-600',
    to: 'to-pink-600',
    gradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-600',
  },
  secondary: {
    from: 'from-pink-500',
    to: 'to-rose-500',
    gradient: 'bg-gradient-to-r from-pink-500 to-rose-500',
    text: 'text-pink-500 dark:text-pink-400',
    bg: 'bg-pink-500',
  },
}

// =============================================================================
// STATUS COLORS
// =============================================================================

export const OUTCOME_COLORS = {
  COMPLETED: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  ABANDONED: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  BLOCKED: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
  },
  CONVERTED: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
  },
} as const

export const SEVERITY_COLORS = {
  INFO: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
    dot: 'bg-gray-500',
  },
  WARNING: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  CRITICAL: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
} as const

export const STATE_COLORS = {
  INIT: 'bg-gray-500',
  COLLECTING_LOCATION: 'bg-blue-500',
  COLLECTING_DATES: 'bg-indigo-500',
  COLLECTING_VEHICLE: 'bg-purple-500',
  CONFIRMING: 'bg-pink-500',
  CHECKING_AUTH: 'bg-orange-500',
  READY_FOR_PAYMENT: 'bg-green-500',
} as const

// =============================================================================
// LABELS
// =============================================================================

export const OUTCOME_LABELS = {
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
  BLOCKED: 'Blocked',
  CONVERTED: 'Converted',
} as const

export const STATE_LABELS = {
  INIT: 'Started',
  COLLECTING_LOCATION: 'Location',
  COLLECTING_DATES: 'Dates',
  COLLECTING_VEHICLE: 'Vehicle',
  CONFIRMING: 'Confirming',
  CHECKING_AUTH: 'Auth Check',
  READY_FOR_PAYMENT: 'Payment Ready',
} as const

export const SECURITY_EVENT_LABELS = {
  rate_limit: 'Rate Limit',
  bot_detected: 'Bot Detected',
  prompt_injection: 'Prompt Injection',
  content_moderation: 'Content Moderation',
  session_terminated: 'Session Terminated',
  session_limit: 'Session Limit',
  message_length: 'Message Length',
  suspicious_pattern: 'Suspicious Pattern',
} as const

// =============================================================================
// MODEL OPTIONS
// =============================================================================

export const MODEL_OPTIONS = [
  // Claude 4.5 Series (Latest - 2025)
  { value: 'claude-haiku-4-5-20251001', label: 'Claude 4.5 Haiku (Recommended)', cost: 1, tier: 'fast' },
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude 4.5 Sonnet (Balanced)', cost: 3, tier: 'balanced' },
  { value: 'claude-opus-4-5-20251101', label: 'Claude 4.5 Opus (Most Capable)', cost: 15, tier: 'advanced' },
  // Claude 3.5 Series (Legacy - 2024)
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Legacy Fast)', cost: 0.25, tier: 'fast' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Legacy Balanced)', cost: 3, tier: 'balanced' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Legacy Advanced)', cost: 15, tier: 'advanced' },
] as const

// =============================================================================
// TABS
// =============================================================================

export const CHOE_TABS = [
  { id: 'overview', label: 'Overview', icon: 'IoStatsChartOutline' },
  { id: 'conversations', label: 'Conversations', icon: 'IoChatbubblesOutline' },
  { id: 'settings', label: 'Settings', icon: 'IoSettingsOutline' },
  { id: 'security', label: 'Security', icon: 'IoShieldCheckmarkOutline' },
  { id: 'analytics', label: 'Analytics', icon: 'IoAnalyticsOutline' },
] as const

export type ChoeTabId = typeof CHOE_TABS[number]['id']

// =============================================================================
// DEFAULT SETTINGS
// =============================================================================

export const DEFAULT_SETTINGS = {
  modelId: 'claude-haiku-4-5-20251001',
  maxTokens: 1024,
  temperature: 0.7,
  serviceFeePercent: 0.15,
  taxRateDefault: 0.084,
  messagesPerWindow: 30,
  rateLimitWindowMins: 5,
  dailyApiLimit: 100,
  sessionMessageLimit: 30,
  maxMessageLength: 200,
  anonymousTimeSeconds: 900,
  anonymousMaxMessages: 30,
  highRiskThreshold: 61,
  verificationThreshold: 31,
  brandName: 'Choé',
  enableEmojis: true,
}

// =============================================================================
// PAGINATION
// =============================================================================

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
}

// =============================================================================
// COST CALCULATION
// =============================================================================

// Cost per 1M tokens (input pricing - output is typically 5x higher)
// With prompt caching, cached tokens cost 90% less (0.1x)
export const COST_PER_1M_TOKENS = {
  // Claude 4.5 Series (2025)
  'claude-haiku-4-5-20251001': 1,      // $1/M input, $5/M output
  'claude-sonnet-4-5-20250929': 3,     // $3/M input, $15/M output
  'claude-opus-4-5-20251101': 15,      // $15/M input, $75/M output
  // Claude 3.5 Series (2024 Legacy)
  'claude-3-5-haiku-20241022': 0.25,   // $0.25/M input, $1.25/M output
  'claude-3-5-sonnet-20241022': 3,     // $3/M input, $15/M output
  'claude-3-opus-20240229': 15,        // $15/M input, $75/M output
} as const

// Prompt caching discount (cached tokens cost 10% of normal)
export const CACHE_DISCOUNT = 0.1

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  cachedTokens: number = 0
): number {
  const inputCostPer1M = COST_PER_1M_TOKENS[model as keyof typeof COST_PER_1M_TOKENS] || 1
  const outputCostPer1M = inputCostPer1M * 5 // Output is 5x input cost

  // Regular input tokens (non-cached)
  const regularInputTokens = inputTokens - cachedTokens
  const inputCost = (regularInputTokens / 1_000_000) * inputCostPer1M

  // Cached tokens (90% discount)
  const cacheCost = (cachedTokens / 1_000_000) * inputCostPer1M * CACHE_DISCOUNT

  // Output tokens (5x input cost)
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M

  return inputCost + cacheCost + outputCost
}

// Simple cost calculation (legacy - total tokens only)
export function calculateCostSimple(tokens: number, model: string): number {
  const costPer1M = COST_PER_1M_TOKENS[model as keyof typeof COST_PER_1M_TOKENS] || 1
  return (tokens / 1_000_000) * costPer1M
}

// =============================================================================
// TIME RANGES
// =============================================================================

export const TIME_RANGES = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
] as const

// =============================================================================
// TOOL NAMES (for AI Function Calling)
// =============================================================================

export const TOOL_NAMES = {
  search_vehicles: {
    label: 'Search Vehicles',
    description: 'Search available cars based on location and criteria',
    icon: 'IoCarOutline',
  },
  get_weather: {
    label: 'Get Weather',
    description: 'Fetch current weather for vehicle recommendations',
    icon: 'IoCloudOutline',
  },
  select_vehicle: {
    label: 'Select Vehicle',
    description: 'User selects a specific vehicle for booking',
    icon: 'IoCheckmarkCircleOutline',
  },
  update_booking_details: {
    label: 'Update Booking',
    description: 'Update or confirm booking details',
    icon: 'IoCreateOutline',
  },
} as const

export type ToolNameKey = keyof typeof TOOL_NAMES

// =============================================================================
// BATCH JOB TYPES (50% cost reduction analytics)
// =============================================================================

export const BATCH_JOB_TYPES = {
  summary: {
    label: 'Conversation Summary',
    description: 'Generate summaries of recent conversations',
    icon: 'IoDocumentTextOutline',
  },
  quality: {
    label: 'Quality Scoring',
    description: 'Score conversation quality and identify issues',
    icon: 'IoStarOutline',
  },
  training: {
    label: 'Training Data',
    description: 'Extract successful conversations for fine-tuning',
    icon: 'IoSchoolOutline',
  },
} as const

export const BATCH_STATUS_COLORS = {
  in_progress: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  ended: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  canceling: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  canceled: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
  expired: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
} as const

// =============================================================================
// VEHICLE TYPE OPTIONS
// =============================================================================

export const VEHICLE_TYPE_OPTIONS = {
  RENTAL: {
    label: 'Rental',
    description: 'Traditional peer-to-peer car rental',
    badgeColor: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    icon: 'IoCarOutline',
  },
  RIDESHARE: {
    label: 'Rideshare',
    description: 'For Uber, DoorDash, Instacart drivers',
    badgeColor: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: 'IoCarSportOutline',
  },
} as const

export const DEPOSIT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Vehicles' },
  { value: 'no_deposit', label: 'No Deposit Required' },
  { value: 'low_deposit', label: 'Low Deposit ($0-$100)' },
  { value: 'standard', label: 'Standard Deposit' },
] as const

// =============================================================================
// ADVANCED FEATURE FLAGS (defaults)
// =============================================================================

export const ADVANCED_FEATURE_DEFAULTS = {
  streamingEnabled: true,
  extendedThinkingEnabled: true,
  toolUseEnabled: true,
  batchAnalyticsEnabled: true,
  preferRideshare: false,
  preferNoDeposit: false,
  showVehicleTypeBadges: true,
} as const
