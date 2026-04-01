// app/lib/featureFlags.ts
// DB-backed feature flags with in-memory cache (60s TTL)

import { prisma } from '@/app/lib/database/prisma'

let cache: Map<string, boolean> = new Map()
let cacheTime = 0
const CACHE_TTL = 60_000 // 60 seconds

const DEFAULT_FLAGS: Record<string, boolean> = {
  CHOE_ENABLED: true,
  CASH_BOOKING: true,
  PUSH_NOTIFICATIONS: true,
  PHONE_AUTH: true,
  GUEST_SIGNUP: true,
  HOST_SIGNUP: true,
  STRIPE_PAYMENTS: true,
  S3_UPLOADS: true,
  MILEAGE_FORENSICS: false,
  VEHICLE_TRACKING: false,
  FLEET_PHOTOS_AI: false,
  PASSKEY_LOGIN: false,
}

async function refreshCache() {
  if (Date.now() - cacheTime < CACHE_TTL && cache.size > 0) return
  try {
    const flags = await prisma.featureFlag.findMany()
    cache = new Map(flags.map(f => [f.key, f.enabled]))
    cacheTime = Date.now()
  } catch {
    // Keep stale cache on DB error
  }
}

export async function getFlag(key: string): Promise<boolean> {
  await refreshCache()
  if (cache.has(key)) return cache.get(key)!
  // Not in DB yet — return default
  return DEFAULT_FLAGS[key] ?? false
}

export async function setFlag(key: string, enabled: boolean, adminId?: string): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled, updatedBy: adminId },
    create: { key, enabled, updatedBy: adminId },
  })
  cache.set(key, enabled)
  console.log(`[FeatureFlag] ${key} → ${enabled} by ${adminId || 'system'}`)
}

export async function getAllFlags(): Promise<Record<string, boolean>> {
  await refreshCache()
  const result = { ...DEFAULT_FLAGS }
  for (const [key, enabled] of cache) {
    result[key] = enabled
  }
  return result
}

export async function seedDefaultFlags(): Promise<number> {
  let created = 0
  for (const [key, enabled] of Object.entries(DEFAULT_FLAGS)) {
    const exists = await prisma.featureFlag.findUnique({ where: { key } })
    if (!exists) {
      await prisma.featureFlag.create({ data: { key, enabled } })
      created++
    }
  }
  return created
}

export { DEFAULT_FLAGS }
