// app/lib/killswitch.ts
// Emergency feature kill — overrides feature flags, returns 503

import { prisma } from '@/app/lib/database/prisma'

// Descriptions for fleet dashboard
export const KILLSWITCH_INFO: Record<string, { label: string; desc: string; impact: string }> = {
  STRIPE_PAYMENTS: { label: 'Stripe Payments', desc: 'All payment processing — bookings, payouts, refunds.', impact: 'Guests cannot book. Hosts cannot receive payouts. Browsing still works.' },
  PUSH_NOTIFICATIONS: { label: 'Push Notifications', desc: 'All push notifications to mobile devices.', impact: 'No booking alerts, no trip reminders, no messages. In-app notifications still work.' },
  EMAIL_SERVICE: { label: 'Email Service (Resend)', desc: 'All outgoing emails — verification, booking confirmation, receipts.', impact: 'No email verification codes, no booking confirmations, no password resets.' },
  CHOE_AI: { label: 'Choé AI', desc: 'AI-powered search and booking assistant.', impact: 'Choé returns "temporarily unavailable". Classic search still works.' },
  PHONE_AUTH: { label: 'Phone Login (Firebase)', desc: 'Phone number OTP authentication.', impact: 'No phone login/signup. Apple, Google, and email login still work.' },
  S3_UPLOADS: { label: 'S3 Photo Uploads', desc: 'Photo uploads to S3/CloudFront.', impact: 'No new photo uploads. Existing photos still display from CDN cache.' },
  GUEST_SIGNUP: { label: 'Guest Signup', desc: 'New guest account creation.', impact: 'No new guest accounts. Existing guests can still log in and book.' },
  HOST_SIGNUP: { label: 'Host Signup', desc: 'New host account creation.', impact: 'No new host accounts. Existing hosts can still manage fleet and bookings.' },
}

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

  // Alert fleet admin via push notification
  try {
    const { sendPushNotification } = await import('@/app/lib/notifications/push')
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true }, take: 5 })
    for (const admin of admins) {
      await sendPushNotification({
        userId: admin.id,
        title: `⚠️ Killswitch: ${feature}`,
        body: reason || 'Feature killed',
        type: 'manual',
      }).catch(() => {})
    }
  } catch {}
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
