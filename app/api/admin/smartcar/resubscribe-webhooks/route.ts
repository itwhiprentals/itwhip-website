// app/api/admin/smartcar/resubscribe-webhooks/route.ts
// Admin endpoint to re-subscribe all active Smartcar vehicles to the webhook
// Use this after fixing the webhook subscription endpoint format

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SMARTCAR_API_URL = 'https://api.smartcar.com/v2.0'
const SMARTCAR_WEBHOOK_ID = process.env.SMARTCAR_WEBHOOK_ID || ''

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
)

// Verify admin authentication
async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('adminAccessToken')?.value

    if (!adminToken) return false

    const { payload } = await jwtVerify(adminToken, ADMIN_JWT_SECRET)
    return payload.type === 'admin' && payload.role === 'ADMIN'
  } catch {
    return false
  }
}

// Subscribe a single vehicle to the webhook
async function subscribeVehicle(
  smartcarVehicleId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Correct endpoint: POST /vehicles/{vehicle_id}/webhooks/{webhook_id}
    const response = await fetch(
      `${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/webhooks/${SMARTCAR_WEBHOOK_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'SC-Unit-System': 'metric'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      return { success: true }
    } else {
      const errorText = await response.text()
      return { success: false, error: `${response.status}: ${errorText}` }
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    // Check webhook ID is configured
    if (!SMARTCAR_WEBHOOK_ID) {
      return NextResponse.json(
        { error: 'SMARTCAR_WEBHOOK_ID not configured in environment' },
        { status: 500 }
      )
    }

    // Get all active vehicles with valid access tokens
    const vehicles = await prisma.smartcarVehicle.findMany({
      where: {
        isActive: true,
        accessToken: { not: null as any }
      },
      select: {
        id: true,
        smartcarVehicleId: true,
        accessToken: true,
        make: true,
        model: true,
        year: true
      }
    })

    if (vehicles.length === 0) {
      return NextResponse.json({
        message: 'No active vehicles found to subscribe',
        subscribed: 0,
        failed: 0,
        results: []
      })
    }

    console.log(`[Admin] Resubscribing ${vehicles.length} vehicles to webhook ${SMARTCAR_WEBHOOK_ID}`)

    const results: Array<{
      vehicleId: string
      vehicle: string
      success: boolean
      error?: string
    }> = []

    let subscribed = 0
    let failed = 0

    // Process vehicles sequentially to avoid rate limits
    for (const vehicle of vehicles) {
      const vehicleLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

      const result = await subscribeVehicle(
        vehicle.smartcarVehicleId,
        vehicle.accessToken!
      )

      if (result.success) {
        subscribed++
        console.log(`[Admin] ✓ Subscribed: ${vehicleLabel}`)

        // Update webhook record in DB
        await prisma.smartcarWebhook.upsert({
          where: { smartcarWebhookId: `wh_${vehicle.smartcarVehicleId}` },
          create: {
            vehicleId: vehicle.id,
            smartcarWebhookId: `wh_${vehicle.smartcarVehicleId}`,
            webhookType: 'scheduled',
            frequency: 'hourly',
            dataPoints: ['location', 'odometer', 'fuel', 'battery', 'charge'],
            isActive: true
          },
          update: {
            isActive: true,
            vehicleId: vehicle.id
          }
        })
      } else {
        failed++
        console.warn(`[Admin] ✗ Failed: ${vehicleLabel} - ${result.error}`)
      }

      results.push({
        vehicleId: vehicle.smartcarVehicleId,
        vehicle: vehicleLabel,
        success: result.success,
        error: result.error
      })

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      message: `Webhook resubscription complete`,
      webhookId: SMARTCAR_WEBHOOK_ID,
      subscribed,
      failed,
      total: vehicles.length,
      results
    })

  } catch (error) {
    console.error('[Admin] Webhook resubscription error:', error)
    return NextResponse.json(
      { error: 'Failed to resubscribe vehicles' },
      { status: 500 }
    )
  }
}

// GET - Check current webhook subscription status
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    // Get all vehicles and their webhook status
    const vehicles = await prisma.smartcarVehicle.findMany({
      where: { isActive: true },
      select: {
        id: true,
        smartcarVehicleId: true,
        make: true,
        model: true,
        year: true,
        lastSyncAt: true,
        webhooks: {
          select: {
            smartcarWebhookId: true,
            isActive: true,
            lastReceivedAt: true
          }
        }
      }
    })

    const summary = vehicles.map(v => ({
      vehicleId: v.smartcarVehicleId,
      vehicle: `${v.year} ${v.make} ${v.model}`,
      lastSync: v.lastSyncAt,
      webhookActive: v.webhooks.some(w => w.isActive),
      lastWebhookReceived: v.webhooks[0]?.lastReceivedAt || null
    }))

    return NextResponse.json({
      webhookId: SMARTCAR_WEBHOOK_ID,
      totalVehicles: vehicles.length,
      withActiveWebhook: summary.filter(s => s.webhookActive).length,
      vehicles: summary
    })

  } catch (error) {
    console.error('[Admin] Webhook status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check webhook status' },
      { status: 500 }
    )
  }
}
