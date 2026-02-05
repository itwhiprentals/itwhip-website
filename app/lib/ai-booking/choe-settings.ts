// app/lib/ai-booking/choe-settings.ts
// Choé AI settings service with in-memory caching (same pattern as platform-settings.ts)

import prisma from '@/app/lib/database/prisma'
import type { ChoeAISettings } from '@prisma/client'

// Re-export the Prisma type for convenience
export type { ChoeAISettings }

// In-memory cache with 5-minute TTL
let settingsCache: ChoeAISettings | null = null
let cacheExpiry: number = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch Choé AI settings from database with caching
 * Creates default settings if they don't exist
 */
export async function getChoeSettings(): Promise<ChoeAISettings> {
  // Check cache first
  if (settingsCache && Date.now() < cacheExpiry) {
    return settingsCache
  }

  // Fetch from database
  let settings = await prisma.choeAISettings.findUnique({
    where: { id: 'global' }
  })

  // Create default settings if they don't exist
  if (!settings) {
    settings = await prisma.choeAISettings.create({
      data: { id: 'global' }
    })
  }

  // Cache the result
  settingsCache = settings
  cacheExpiry = Date.now() + CACHE_TTL_MS

  return settingsCache
}

/**
 * Clear the settings cache (call after updates)
 */
export function clearChoeSettingsCache(): void {
  settingsCache = null
  cacheExpiry = 0
}

/**
 * Update Choé AI settings
 * Automatically clears cache after update
 */
export async function updateChoeSettings(
  data: Partial<Omit<ChoeAISettings, 'id' | 'updatedAt'>>,
  updatedBy?: string
): Promise<ChoeAISettings> {
  const settings = await prisma.choeAISettings.upsert({
    where: { id: 'global' },
    update: {
      ...data,
      updatedBy: updatedBy || null,
    },
    create: {
      id: 'global',
      ...data,
      updatedBy: updatedBy || null,
    }
  })

  // Clear cache so next fetch gets fresh data
  clearChoeSettingsCache()

  return settings
}

// =============================================================================
// HELPER FUNCTIONS FOR SPECIFIC SETTINGS
// =============================================================================

/**
 * Check if Choé AI is enabled
 */
export async function isChoeEnabled(): Promise<boolean> {
  const settings = await getChoeSettings()
  return settings.enabled
}

/**
 * Get rate limit configuration
 */
export async function getRateLimitConfig(): Promise<{
  messagesPerWindow: number
  rateLimitWindowMins: number
  dailyApiLimit: number
  sessionMessageLimit: number
  maxMessageLength: number
  anonymousTimeSeconds: number
  anonymousMaxMessages: number
}> {
  const settings = await getChoeSettings()
  return {
    messagesPerWindow: settings.messagesPerWindow,
    rateLimitWindowMins: settings.rateLimitWindowMins,
    dailyApiLimit: settings.dailyApiLimit,
    sessionMessageLimit: settings.sessionMessageLimit,
    maxMessageLength: settings.maxMessageLength,
    anonymousTimeSeconds: settings.anonymousTimeSeconds,
    anonymousMaxMessages: settings.anonymousMaxMessages,
  }
}

/**
 * Get model configuration
 */
export async function getModelConfig(): Promise<{
  modelId: string
  maxTokens: number
  temperature: number
}> {
  const settings = await getChoeSettings()
  return {
    modelId: settings.modelId,
    maxTokens: settings.maxTokens,
    temperature: settings.temperature,
  }
}

/**
 * Get risk threshold configuration
 */
export async function getRiskConfig(): Promise<{
  highRiskThreshold: number
  verificationThreshold: number
  anonymousUserPoints: number
  unverifiedUserPoints: number
  highValuePoints: number
  exoticVehiclePoints: number
}> {
  const settings = await getChoeSettings()
  return {
    highRiskThreshold: settings.highRiskThreshold,
    verificationThreshold: settings.verificationThreshold,
    anonymousUserPoints: settings.anonymousUserPoints,
    unverifiedUserPoints: settings.unverifiedUserPoints,
    highValuePoints: settings.highValuePoints,
    exoticVehiclePoints: settings.exoticVehiclePoints,
  }
}

/**
 * Get personality configuration
 */
export async function getPersonalityConfig(): Promise<{
  brandName: string
  enableEmojis: boolean
  serviceRegions: string[]
  suggestionChips: Record<string, string[]> | null
}> {
  const settings = await getChoeSettings()
  return {
    brandName: settings.brandName,
    enableEmojis: settings.enableEmojis,
    serviceRegions: settings.serviceRegions as string[],
    suggestionChips: settings.suggestionChips as Record<string, string[]> | null,
  }
}

/**
 * Get pricing configuration
 */
export async function getPricingConfig(): Promise<{
  serviceFeePercent: number
  taxRateDefault: number
}> {
  const settings = await getChoeSettings()
  return {
    serviceFeePercent: settings.serviceFeePercent,
    taxRateDefault: settings.taxRateDefault,
  }
}

/**
 * Get feature flags
 */
export async function getFeatureFlags(): Promise<{
  enabled: boolean
  weatherEnabled: boolean
  riskAssessmentEnabled: boolean
  anonymousAccessEnabled: boolean
}> {
  const settings = await getChoeSettings()
  return {
    enabled: settings.enabled,
    weatherEnabled: settings.weatherEnabled,
    riskAssessmentEnabled: settings.riskAssessmentEnabled,
    anonymousAccessEnabled: settings.anonymousAccessEnabled,
  }
}
