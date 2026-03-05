// app/api/fleet/cron/[name]/trigger/route.ts
// Manual trigger for individual cron jobs from the fleet dashboard

import { NextRequest, NextResponse } from 'next/server'

const CRON_ENDPOINTS: Record<string, { endpoint: string; method: string }> = {
  'expire-holds': { endpoint: '/api/cron/expire-holds', method: 'POST' },
  'release-deposits': { endpoint: '/api/cron/release-deposits', method: 'POST' },
  'auto-complete': { endpoint: '/api/cron/auto-complete', method: 'POST' },
  'pickup-reminder': { endpoint: '/api/cron/pickup-reminder', method: 'POST' },
  'return-reminder': { endpoint: '/api/cron/return-reminder', method: 'POST' },
  'expire-overdue-pickups': { endpoint: '/api/cron/expire-overdue-pickups', method: 'POST' },
  'noshow-detection': { endpoint: '/api/cron/noshow-detection', method: 'POST' },
  'payment-deadline': { endpoint: '/api/cron/payment-deadline', method: 'POST' },
  'host-acceptance-reminders': { endpoint: '/api/cron/host-acceptance-reminders', method: 'POST' },
  'master-cron': { endpoint: '/api/admin/system/cron', method: 'GET' },
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const config = CRON_ENDPOINTS[name]

    if (!config) {
      return NextResponse.json(
        { error: `Unknown cron job: ${name}` },
        { status: 400 }
      )
    }

    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin

    const response = await fetch(`${baseUrl}${config.endpoint}`, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
        'x-triggered-by': 'manual',
      },
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      jobName: name,
      result,
    })
  } catch (error) {
    console.error('[Fleet Cron Trigger] Error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger cron job', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
