import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET() {
  const results = await Promise.all([
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
