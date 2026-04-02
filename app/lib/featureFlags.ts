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

// Descriptions for fleet dashboard display
export const FLAG_DESCRIPTIONS: Record<string, { label: string; desc: string; wired: boolean }> = {
  CHOE_ENABLED: { label: 'Choé AI', desc: 'AI-powered car search and booking assistant. Disabling returns 503 on /api/ai/booking/stream.', wired: true },
  CASH_BOOKING: { label: 'Cash Bookings', desc: 'Allow cash payment bookings (no Stripe required). Not yet wired — planned feature.', wired: false },
  PUSH_NOTIFICATIONS: { label: 'Push Notifications', desc: 'All push notifications to guests and hosts. Disabling silently skips all push sends.', wired: true },
  PHONE_AUTH: { label: 'Phone Login (Firebase)', desc: 'Phone number OTP login via Firebase. Disabling blocks /api/auth/phone-login with 503.', wired: true },
  GUEST_SIGNUP: { label: 'Guest Signup', desc: 'New guest account creation. Disabling blocks /api/auth/signup with 503.', wired: true },
  HOST_SIGNUP: { label: 'Host Signup', desc: 'New host account creation. Disabling blocks /api/host/signup with 503.', wired: true },
  STRIPE_PAYMENTS: { label: 'Stripe Payments', desc: 'All Stripe-powered bookings and payments. Disabling blocks /api/rentals/book with 503.', wired: true },
  S3_UPLOADS: { label: 'S3 Photo Uploads', desc: 'Photo uploads to S3/CloudFront. Not yet wired — planned guard on upload routes.', wired: false },
  MILEAGE_FORENSICS: { label: 'Mileage Forensics', desc: 'AI mileage analysis from odometer photos. Future feature — not yet built.', wired: false },
  VEHICLE_TRACKING: { label: 'Vehicle Tracking', desc: 'Real-time GPS tracking of rented vehicles. Future feature — not yet built.', wired: false },
  FLEET_PHOTOS_AI: { label: 'Fleet Photos AI', desc: 'AI-powered photo quality analysis and damage detection. Future feature — not yet built.', wired: false },
  PASSKEY_LOGIN: { label: 'Passkey Login', desc: 'WebAuthn/FIDO2 passwordless login. Future feature — not yet built.', wired: false },
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
