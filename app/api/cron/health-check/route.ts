// app/api/cron/health-check/route.ts
// Proactive health check — runs every 5 minutes via EventBridge
// Checks: DB, Stripe, S3, CloudFront, Expo Push, Resend

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { killFeature, reviveFeature } from '@/app/lib/killswitch'

const CRON_SECRET = process.env.CRON_SECRET

interface CheckResult {
  service: string
  status: 'ok' | 'down'
  latencyMs: number
  error?: string
}

async function checkService(name: string, fn: () => Promise<void>): Promise<CheckResult> {
  const start = Date.now()
  try {
    await fn()
    return { service: name, status: 'ok', latencyMs: Date.now() - start }
  } catch (err: any) {
    return { service: name, status: 'down', latencyMs: Date.now() - start, error: err.message }
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get('authorization')
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: CheckResult[] = await Promise.all([
    // Database
    checkService('database', async () => {
      await prisma.$queryRaw`SELECT 1`
    }),

    // Stripe
    checkService('stripe', async () => {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      })
      if (!res.ok) throw new Error(`Stripe ${res.status}`)
    }),

    // S3 (public bucket)
    checkService('s3', async () => {
      const res = await fetch(`https://${process.env.AWS_CLOUDFRONT_DOMAIN || 'photos.itwhip.com'}/`, { method: 'HEAD' })
      // CloudFront returns 403 for root — that's fine, it means it's responding
      if (res.status >= 500) throw new Error(`CloudFront ${res.status}`)
    }),

    // Expo Push
    checkService('expo-push', async () => {
      const res = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      })
      if (!res.ok) throw new Error(`Expo ${res.status}`)
    }),

    // Resend
    checkService('resend', async () => {
      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      })
      if (!res.ok) throw new Error(`Resend ${res.status}`)
    }),

    // Twilio SMS
    checkService('twilio', async () => {
      const res = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', {
        headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}` },
      })
      if (!res.ok) throw new Error(`Twilio ${res.status}`)
    }),

    // Firebase Auth
    checkService('firebase', async () => {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"idToken":"test"}',
      })
      if (res.status >= 500) throw new Error(`Firebase ${res.status}`)
    }),

    // Anthropic / Claude API
    checkService('anthropic', async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }),
      })
      if (res.status >= 500) throw new Error(`Anthropic ${res.status}`)
    }),

    // Website self-check
    checkService('website', async () => {
      const res = await fetch('https://itwhip.com/api/auth/check-dual-role')
      if (res.status >= 500) throw new Error(`Website ${res.status}`)
    }),
  ])

  // Auto-killswitch for down services
  const killswitchMap: Record<string, string> = {
    stripe: 'STRIPE_PAYMENTS',
    'expo-push': 'PUSH_NOTIFICATIONS',
    resend: 'EMAIL_SERVICE',
    anthropic: 'CHOE_AI',
    firebase: 'PHONE_AUTH',
  }

  for (const result of results) {
    const flag = killswitchMap[result.service]
    if (!flag) continue
    if (result.status === 'down') {
      await killFeature(flag, `Health check: ${result.service} down — ${result.error}`, 'system').catch(() => {})
    } else {
      await reviveFeature(flag, 'system').catch(() => {})
    }
  }

  const allOk = results.every(r => r.status === 'ok')
  const downServices = results.filter(r => r.status === 'down')

  if (downServices.length > 0) {
    console.error('[Health Check] DOWN:', downServices.map(s => s.service).join(', '))
  }

  console.log(`[Health Check] ${allOk ? '✅ All OK' : `⚠️ ${downServices.length} down`} — ${results.map(r => `${r.service}:${r.latencyMs}ms`).join(', ')}`)

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: results,
  })
}
