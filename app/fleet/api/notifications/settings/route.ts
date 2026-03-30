// app/fleet/api/notifications/settings/route.ts
// Toggle automated notification types on/off

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

const ALL_TYPES = [
  'booking_request', 'booking_confirmed', 'booking_cancelled', 'message', 'payment',
  'trip_reminder', 'review_request', 'host_reminder',
  'fleet_booking_approved', 'fleet_booking_declined',
  'fleet_suspended', 'fleet_warned', 'fleet_suspension_lifted', 'fleet_bonus',
  'fleet_car_on_hold', 'fleet_car_released', 'fleet_vehicle_assigned',
  'fleet_claim_filed', 'fleet_vehicle_update', 'fleet_commission_update',
]

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const settings = await prisma.notificationTypeSettings.findMany()
    const settingsMap: Record<string, boolean> = {}
    for (const s of settings) settingsMap[s.type] = s.enabled

    // Return all types with their status (default: enabled)
    const result = ALL_TYPES.map(type => ({
      type,
      enabled: settingsMap[type] ?? true,
    }))

    return NextResponse.json({ settings: result })
  } catch (error) {
    console.error('[Fleet Notifications] Settings GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== FLEET_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, enabled } = await request.json()
    if (!type || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'type and enabled (boolean) are required' }, { status: 400 })
    }

    await prisma.notificationTypeSettings.upsert({
      where: { type },
      update: { enabled },
      create: { type, enabled },
    })

    console.log(`[Fleet Notifications] Type ${type} set to ${enabled ? 'ENABLED' : 'DISABLED'}`)
    return NextResponse.json({ success: true, type, enabled })
  } catch (error) {
    console.error('[Fleet Notifications] Settings PUT error:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
