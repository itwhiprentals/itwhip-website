import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET() {
  const results = await Promise.all([
    // Core infrastructure
    check('database', async () => { await prisma.$queryRaw`SELECT 1` }),

    check('stripe', async () => {
      const res = await fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
    }),

    check('s3', async () => {
      const res = await fetch(`https://${process.env.AWS_CLOUDFRONT_DOMAIN || 'photos.itwhip.com'}/`, { method: 'HEAD' })
      if (res.status >= 500) throw new Error(`${res.status}`)
    }),

    // Communication services
    check('expo-push', async () => {
      const res = await fetch('https://exp.host/--/api/v2/push/getReceipts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"ids":[]}',
      })
      if (!res.ok) throw new Error(`${res.status}`)
    }),

    check('resend', async () => {
      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
    }),

    check('twilio', async () => {
      const res = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', {
        headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
    }),

    // Auth & AI services
    check('firebase', async () => {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"idToken":"test"}',
      })
      // 400 = invalid token (expected) = Firebase is responding
      if (res.status >= 500) throw new Error(`${res.status}`)
    }),

    check('anthropic', async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }),
      })
      // Any response means the API is reachable — even 400/401
      if (res.status >= 500) throw new Error(`${res.status}`)
    }),

    // Website self-check
    check('website', async () => {
      const res = await fetch('https://itwhip.com/api/auth/check-dual-role', { method: 'GET' })
      // 401 = expected (no auth) = website is responding
      if (res.status >= 500) throw new Error(`${res.status}`)
    }),
  ])

  const allOk = results.every(r => r.status === 'ok')

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: results,
  })
}

async function check(name: string, fn: () => Promise<void>) {
  const start = Date.now()
  try {
    await fn()
    return { service: name, status: 'ok' as const, latencyMs: Date.now() - start }
  } catch (err: any) {
    return { service: name, status: 'down' as const, latencyMs: Date.now() - start, error: err.message }
  }
}
