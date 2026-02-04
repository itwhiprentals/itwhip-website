// app/api/webhooks/smartcar/route.ts
// Receive webhook events from Smartcar (VERIFY, VEHICLE_STATE, VEHICLE_ERROR)
// Payload format v4.0 uses signals array with code/group/body
// SECURITY FIX: Added webhook signature verification

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { createHmac, timingSafeEqual } from 'crypto'

const SMARTCAR_MANAGEMENT_TOKEN = process.env.SMARTCAR_MANAGEMENT_TOKEN || ''
const SMARTCAR_WEBHOOK_SECRET = process.env.SMARTCAR_WEBHOOK_SECRET || ''

// Hash challenge for VERIFY handshake
function hashChallenge(amt: string, challenge: string): string {
  const hmac = createHmac('sha256', amt)
  hmac.update(challenge)
  return hmac.digest('hex')
}

// SECURITY FIX: Verify webhook signature using timing-safe comparison
function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!SMARTCAR_WEBHOOK_SECRET) {
    console.error('[Smartcar Webhook] Missing SMARTCAR_WEBHOOK_SECRET env var')
    return false
  }

  const expectedSignature = createHmac('sha256', SMARTCAR_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer)
  } catch {
    return false
  }
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
    // SECURITY FIX: Get raw body for signature verification
    const rawBody = await request.text()

    // Parse payload
    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (!payload || !payload.eventType) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const eventType = payload.eventType
    console.log(`[Smartcar Webhook] eventType: ${eventType}`)

    // ============================================
    // VERIFY - challenge handshake (no signature check needed)
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
    // SECURITY: Webhook validation for non-VERIFY events
    // Smartcar relies on:
    // 1. VERIFY handshake (proves endpoint ownership)
    // 2. HTTPS-only webhook URLs
    // 3. We add: vehicle ID validation against our database
    // ============================================

    // Optional: If SMARTCAR_WEBHOOK_SECRET is configured, verify signature
    const signature = request.headers.get('sc-signature')
    if (SMARTCAR_WEBHOOK_SECRET && signature) {
      if (!verifyWebhookSignature(rawBody, signature)) {
        console.warn('[Smartcar Webhook] Invalid signature - rejecting webhook')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      console.log('[Smartcar Webhook] Signature verified successfully')
    }

    // Validate webhook has required structure
    if (!payload.data?.vehicle?.id) {
      console.warn('[Smartcar Webhook] Missing vehicle ID in payload')
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
    }

    // Log webhook metadata for audit trail
    const webhookMeta = payload.meta || {}
    console.log(`[Smartcar Webhook] Processing: webhookId=${webhookMeta.webhookId}, mode=${webhookMeta.mode}, signals=${webhookMeta.signalCount}`)

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
