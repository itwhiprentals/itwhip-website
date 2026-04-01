// app/lib/killswitch.ts
// Emergency feature kill — overrides feature flags, returns 503

import { prisma } from '@/app/lib/database/prisma'

let cache: Map<string, boolean> = new Map()
let cacheTime = 0
const CACHE_TTL = 10_000 // 10 seconds (faster than feature flags — emergency)

async function refreshCache() {
  if (Date.now() - cacheTime < CACHE_TTL && cache.size > 0) return
  try {
    const switches = await prisma.killswitch.findMany({ where: { active: true } })
    cache = new Map(switches.map(s => [s.feature, true]))
    cacheTime = Date.now()
  } catch {
    // Keep stale cache on DB error
  }
}

export async function isKilled(feature: string): Promise<boolean> {
  await refreshCache()
  return cache.get(feature) || false
}

export async function killFeature(feature: string, reason: string, adminId?: string): Promise<void> {
  await prisma.killswitch.upsert({
    where: { feature },
    update: { active: true, reason, killedAt: new Date(), killedBy: adminId },
    create: { feature, active: true, reason, killedAt: new Date(), killedBy: adminId },
  })
  cache.set(feature, true)
  console.log(`[Killswitch] KILLED: ${feature} — ${reason} by ${adminId || 'system'}`)
}

export async function reviveFeature(feature: string, adminId?: string): Promise<void> {
  await prisma.killswitch.upsert({
    where: { feature },
    update: { active: false, reason: null, killedAt: null, killedBy: null },
    create: { feature, active: false },
  })
  cache.delete(feature)
  console.log(`[Killswitch] REVIVED: ${feature} by ${adminId || 'system'}`)
}

export async function getAllKillswitches() {
  return prisma.killswitch.findMany({ orderBy: { feature: 'asc' } })
}

export function maintenanceResponse(feature: string) {
  return {
    error: 'This feature is temporarily unavailable',
    maintenance: true,
    feature,
  }
}
