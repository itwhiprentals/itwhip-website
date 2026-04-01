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

// Build system prompt injection from live config
export async function getChoeSystemPromptAddon(): Promise<string> {
  const [addon, promos, seasonal] = await Promise.all([
    getChoeConfig('SYSTEM_PROMPT_ADDON'),
    getChoeConfig('ACTIVE_PROMOTIONS'),
    getChoeConfig('SEASONAL_MESSAGE'),
  ])

  const parts: string[] = []
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
