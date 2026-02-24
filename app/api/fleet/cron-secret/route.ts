// app/api/fleet/cron-secret/route.ts
// Returns the CRON_SECRET to authenticated fleet admins for manual cron triggers

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const fleetSession = request.cookies.get('fleet_session')?.value
    if (!fleetSession || !/^[a-f0-9]{64}$/.test(fleetSession)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
    return NextResponse.json({ secret: cronSecret })
  } catch (error) {
    console.error('[Fleet] cron-secret error:', error)
    return NextResponse.json({ error: 'Failed to retrieve cron secret' }, { status: 500 })
  }
}
