// app/api/webhooks/smartcar/route.ts
// Receive webhook events from Smartcar (VERIFY, VEHICLE_STATE, VEHICLE_ERROR)
// Uses smartcar.hashChallenge equivalent for VERIFY handshake

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { createHmac } from 'crypto'

const SMARTCAR_MANAGEMENT_TOKEN = process.env.SMARTCAR_MANAGEMENT_TOKEN || ''

// Hash challenge for VERIFY handshake (equivalent to smartcar.hash_challenge)
function hashChallenge(amt: string, challenge: string): string {
  const hmac = createHmac('sha256', amt)
  hmac.update(challenge)
  return hmac.digest('hex')
}

// Convert kPa to PSI
function kpaToPsi(kpa: number): number {
  return Math.round(kpa * 0.145038)
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    if (!payload || !payload.eventType) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const eventType = payload.eventType
    console.log(`[Smartcar Webhook] Received eventType: ${eventType}`)

    // ============================================
    // VERIFY - Smartcar challenge handshake
    // ============================================
    if (eventType === 'VERIFY') {
      const challenge = payload.data?.challenge
      if (!challenge) {
        return NextResponse.json({ error: 'Missing challenge' }, { status: 400 })
      }

      if (!SMARTCAR_MANAGEMENT_TOKEN) {
        console.error('[Smartcar Webhook] No management token for VERIFY')
        return NextResponse.json({ error: 'Not configured' }, { status: 500 })
      }

      const hmac = hashChallenge(SMARTCAR_MANAGEMENT_TOKEN, challenge)
      console.log('[Smartcar Webhook] VERIFY challenge responded')
      return NextResponse.json({ challenge: hmac })
    }

    // ============================================
    // VEHICLE_STATE - Vehicle data update
    // ============================================
    if (eventType === 'VEHICLE_STATE') {
      const vehicleId = payload.vehicleId
      const data = payload.data || {}
      const timestamp = payload.timestamp || new Date().toISOString()

      if (!vehicleId) {
        console.warn('[Smartcar Webhook] VEHICLE_STATE missing vehicleId')
        return NextResponse.json({ received: true })
      }

      // Find vehicle by Smartcar vehicle ID
      const vehicle = await prisma.smartcarVehicle.findUnique({
        where: { smartcarVehicleId: vehicleId }
      })

      if (!vehicle) {
        console.warn(`[Smartcar Webhook] Unknown vehicle: ${vehicleId}`)
        return NextResponse.json({ received: true })
      }

      if (!vehicle.isActive) {
        console.warn(`[Smartcar Webhook] Inactive vehicle: ${vehicleId}`)
        return NextResponse.json({ received: true })
      }

      // Build update data from whatever fields Smartcar sends
      const updateData: Record<string, unknown> = {
        lastSyncAt: new Date(timestamp)
      }

      // Location
      if (data.location) {
        updateData.lastLocation = {
          lat: data.location.latitude,
          lng: data.location.longitude,
          timestamp
        }
      }

      // Odometer (Smartcar sends km in metric mode)
      if (data.odometer?.distance != null) {
        updateData.lastOdometer = data.odometer.distance * 0.621371 // km to miles
      }

      // Fuel
      if (data.fuel?.percentRemaining != null) {
        updateData.lastFuel = data.fuel.percentRemaining * 100
      }

      // Battery / EV
      if (data.battery?.percentRemaining != null) {
        updateData.lastBattery = data.battery.percentRemaining * 100
      }

      // Charge state
      if (data.charge) {
        updateData.lastChargeState = {
          isPluggedIn: data.charge.isPluggedIn,
          state: data.charge.state
        }
      }

      // Tire pressure (kPa -> PSI)
      if (data.tires?.pressure) {
        updateData.lastTirePressure = {
          frontLeft: kpaToPsi(data.tires.pressure.frontLeft),
          frontRight: kpaToPsi(data.tires.pressure.frontRight),
          backLeft: kpaToPsi(data.tires.pressure.backLeft),
          backRight: kpaToPsi(data.tires.pressure.backRight)
        }
      }

      // Engine oil
      if (data.engineOil?.lifeRemaining != null) {
        updateData.lastOilLife = data.engineOil.lifeRemaining * 100
      }

      // Security / lock status
      if (data.security?.isLocked != null) {
        updateData.lastLockStatus = data.security.isLocked ? 'locked' : 'unlocked'
      }

      // Update vehicle in DB
      await prisma.smartcarVehicle.update({
        where: { id: vehicle.id },
        data: updateData
      })

      console.log(`[Smartcar Webhook] Updated vehicle ${vehicleId}: ${Object.keys(updateData).join(', ')}`)
      return NextResponse.json({ received: true })
    }

    // ============================================
    // VEHICLE_ERROR - Vehicle error event
    // ============================================
    if (eventType === 'VEHICLE_ERROR') {
      const vehicleId = payload.vehicleId
      const error = payload.data || payload.error
      console.error(`[Smartcar Webhook] VEHICLE_ERROR for ${vehicleId}:`, error)
      return NextResponse.json({ received: true })
    }

    // Unknown event type
    console.warn(`[Smartcar Webhook] Unknown eventType: ${eventType}`)
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Smartcar Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
