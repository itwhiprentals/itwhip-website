// app/lib/ai/choeConfig.ts
// Hot-reload Choé config — fetched on every message (cached 60s)

import { prisma } from '@/app/lib/database/prisma'

let cache: Map<string, string> = new Map()
let cacheTime = 0
const CACHE_TTL = 60_000

const DEFAULT_CONFIG: Record<string, string> = {
  SYSTEM_PROMPT_ADDON: '',
  ACTIVE_PROMOTIONS: '[]',
  SEASONAL_MESSAGE: '',
  BLOCKED_CARS: '[]',
  MIN_BOOKING_DAYS: '1',
  MAX_BOOKING_DAYS: '30',
  SEARCH_RADIUS_MILES: '50',
  CHOE_PERSONALITY: 'friendly',
  CHOE_LANGUAGE_DEFAULT: 'en',
}

async function refreshCache() {
  if (Date.now() - cacheTime < CACHE_TTL && cache.size > 0) return
  try {
    const configs = await prisma.choeConfig.findMany()
    cache = new Map(configs.map(c => [c.key, c.value]))
    cacheTime = Date.now()
  } catch {
    // Keep stale cache
  }
}

export async function getChoeConfig(key: string): Promise<string> {
  await refreshCache()
  return cache.get(key) ?? DEFAULT_CONFIG[key] ?? ''
}

export async function setChoeConfig(key: string, value: string, adminId?: string): Promise<void> {
  await prisma.choeConfig.upsert({
    where: { key },
    update: { value, updatedBy: adminId },
    create: { key, value, updatedBy: adminId },
  })
  cache.set(key, value)
  console.log(`[ChoeConfig] ${key} updated by ${adminId || 'system'}`)
}

export async function getAllChoeConfig(): Promise<Record<string, string>> {
  await refreshCache()
  const result = { ...DEFAULT_CONFIG }
  for (const [key, value] of cache) {
    result[key] = value
  }
  return result
}

// Personality tone templates — additive layer on top of base Choé identity
const PERSONALITY_TEMPLATES: Record<string, string> = {
  friendly: 'TONE: Be warm and conversational. Use emojis sparingly (1-2 per message). Say things like "awesome", "great choice", "love that". Keep it casual and approachable. You\'re a helpful friend who knows cars.',
  professional: 'TONE: Be formal and concise. No emojis ever. Use complete sentences with proper grammar. Say "certainly", "I\'d be happy to assist", "excellent choice". Address the guest respectfully. You\'re a knowledgeable consultant.',
  enthusiast: 'TONE: Be genuinely excited about cars. Use car terminology naturally — mention specs, 0-60 times, horsepower, handling when relevant. Say "this beast", "absolute steal", "seriously quick". You\'re a fellow car lover helping a friend pick their next ride.',
  concierge: 'TONE: Be luxurious and attentive. Use phrases like "I\'ve curated", "for your consideration", "exceptional value", "may I suggest". Treat every request as a personal concierge would. You\'re a white-glove service provider.',
}

// Build system prompt injection from live config
export async function getChoeSystemPromptAddon(): Promise<string> {
  const [addon, promos, seasonal, personality] = await Promise.all([
    getChoeConfig('SYSTEM_PROMPT_ADDON'),
    getChoeConfig('ACTIVE_PROMOTIONS'),
    getChoeConfig('SEASONAL_MESSAGE'),
    getChoeConfig('CHOE_PERSONALITY'),
  ])

  const parts: string[] = []

  // Personality tone (additive — does NOT replace base identity)
  const toneTemplate = PERSONALITY_TEMPLATES[personality] || PERSONALITY_TEMPLATES.friendly
  parts.push(toneTemplate)

  if (addon) parts.push(addon)
  if (seasonal) parts.push(`Seasonal message: ${seasonal}`)

  try {
    const promotions = JSON.parse(promos)
    if (Array.isArray(promotions) && promotions.length > 0) {
      parts.push(`Current promotions: ${promotions.join('. ')}. Mention naturally if relevant.`)
    }
  } catch {}

  return parts.join('\n')
}

export { DEFAULT_CONFIG }
