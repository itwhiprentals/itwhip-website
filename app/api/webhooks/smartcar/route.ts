// app/api/webhooks/smartcar/route.ts
// Receive webhook events from Smartcar (VERIFY, VEHICLE_STATE, VEHICLE_ERROR)
// Payload format v4.0 uses signals array with code/group/body

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { createHmac } from 'crypto'

const SMARTCAR_MANAGEMENT_TOKEN = process.env.SMARTCAR_MANAGEMENT_TOKEN || ''

// Hash challenge for VERIFY handshake
function hashChallenge(amt: string, challenge: string): string {
  const hmac = createHmac('sha256', amt)
  hmac.update(challenge)
  return hmac.digest('hex')
}

// Extract a signal value from the signals array
function getSignal(signals: Signal[], code: string): Signal | undefined {
  return signals.find(s => s.code === code && s.status?.value === 'SUCCESS')
}

interface Signal {
  code: string
  name: string
  group: string
  body: Record<string, unknown>
  status: { value: string }
  meta?: { oemUpdatedAt?: number; retrievedAt?: number }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    if (!payload || !payload.eventType) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const eventType = payload.eventType
    console.log(`[Smartcar Webhook] eventType: ${eventType}`)

    // ============================================
    // VERIFY - challenge handshake
    // ============================================
    if (eventType === 'VERIFY') {
      const challenge = payload.data?.challenge
      if (!challenge || !SMARTCAR_MANAGEMENT_TOKEN) {
        return NextResponse.json({ error: 'Missing challenge or token' }, { status: 400 })
      }
      const hmac = hashChallenge(SMARTCAR_MANAGEMENT_TOKEN, challenge)
      console.log('[Smartcar Webhook] VERIFY responded')
      return NextResponse.json({ challenge: hmac })
    }

    // ============================================
    // VEHICLE_STATE - v4.0 signals format
    // ============================================
    if (eventType === 'VEHICLE_STATE') {
      const vehicleData = payload.data?.vehicle
      const signals: Signal[] = payload.data?.signals || []
      const smartcarVehicleId = vehicleData?.id
      const webhookId = payload.meta?.webhookId
      const deliveredAt = payload.meta?.deliveredAt

      if (!smartcarVehicleId) {
        console.warn('[Smartcar Webhook] VEHICLE_STATE missing vehicle id')
        return NextResponse.json({ received: true })
      }

      // Find vehicle in DB
      const vehicle = await prisma.smartcarVehicle.findUnique({
        where: { smartcarVehicleId }
      })

      if (!vehicle) {
        console.warn(`[Smartcar Webhook] Unknown vehicle: ${smartcarVehicleId}`)
        return NextResponse.json({ received: true })
      }

      if (!vehicle.isActive) {
        console.warn(`[Smartcar Webhook] Inactive vehicle: ${smartcarVehicleId}`)
        return NextResponse.json({ received: true })
      }

      // Build update from signals
      const updateData: Record<string, unknown> = {
        lastSyncAt: deliveredAt ? new Date(deliveredAt) : new Date()
      }

      // Lock status
      const lockSignal = getSignal(signals, 'closure-islocked')
      if (lockSignal) {
        updateData.lastLockStatus = lockSignal.body.value ? 'locked' : 'unlocked'
      }

      // Fuel level (already in percent)
      const fuelSignal = getSignal(signals, 'internalcombustionengine-fuellevel')
      if (fuelSignal && fuelSignal.body.value != null) {
        updateData.lastFuel = fuelSignal.body.value as number
      }

      // Odometer (km -> miles)
      const odoSignal = getSignal(signals, 'odometer-traveleddistance')
      if (odoSignal && odoSignal.body.value != null) {
        updateData.lastOdometer = (odoSignal.body.value as number) * 0.621371
      }

      // Battery / EV state of charge (already in percent)
      const batterySignal = getSignal(signals, 'tractionbattery-stateofcharge')
      if (batterySignal && batterySignal.body.value != null) {
        updateData.lastBattery = batterySignal.body.value as number
      }

      // Update vehicle make/model/year if provided and different
      if (vehicleData.make && vehicleData.model && vehicleData.year) {
        updateData.make = vehicleData.make
        updateData.model = vehicleData.model
        updateData.year = vehicleData.year
      }

      // Update vehicle in DB
      await prisma.smartcarVehicle.update({
        where: { id: vehicle.id },
        data: updateData
      })

      // Update webhook last received
      if (webhookId) {
        await prisma.smartcarWebhook.updateMany({
          where: { smartcarWebhookId: webhookId, vehicleId: vehicle.id },
          data: { lastReceivedAt: new Date() }
        })
      }

      console.log(`[Smartcar Webhook] Updated ${smartcarVehicleId}: ${Object.keys(updateData).join(', ')}`)
      return NextResponse.json({ received: true })
    }

    // ============================================
    // VEHICLE_ERROR
    // ============================================
    if (eventType === 'VEHICLE_ERROR') {
      console.error(`[Smartcar Webhook] VEHICLE_ERROR:`, JSON.stringify(payload.data))
      return NextResponse.json({ received: true })
    }

    console.warn(`[Smartcar Webhook] Unknown eventType: ${eventType}`)
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Smartcar Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
