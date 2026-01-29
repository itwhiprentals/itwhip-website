// app/api/smartcar/disconnect/route.ts
// Disconnect a vehicle from Smartcar

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SMARTCAR_CLIENT_ID = process.env.SMARTCAR_CLIENT_ID
const SMARTCAR_CLIENT_SECRET = process.env.SMARTCAR_CLIENT_SECRET
const SMARTCAR_API_URL = 'https://api.smartcar.com/v2.0'
const SMARTCAR_AUTH_URL = 'https://auth.smartcar.com/oauth/token'

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })
  } catch {
    return null
  }
}

// POST /api/smartcar/disconnect - Disconnect a vehicle
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as a host.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { vehicleId, smartcarVehicleId } = body

    if (!vehicleId && !smartcarVehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID required' },
        { status: 400 }
      )
    }

    // Find the vehicle
    const vehicle = await prisma.smartcarVehicle.findFirst({
      where: {
        hostId: host.id,
        OR: [
          { id: vehicleId || undefined },
          { smartcarVehicleId: smartcarVehicleId || undefined }
        ]
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Revoke access on Smartcar's side
    if (vehicle.accessToken) {
      try {
        // Refresh token if expired
        let accessToken = vehicle.accessToken
        const expiresIn = vehicle.tokenExpiresAt.getTime() - Date.now()
        if (expiresIn < 60 * 1000 && vehicle.refreshToken && SMARTCAR_CLIENT_ID && SMARTCAR_CLIENT_SECRET) {
          const refreshRes = await fetch(SMARTCAR_AUTH_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + Buffer.from(`${SMARTCAR_CLIENT_ID}:${SMARTCAR_CLIENT_SECRET}`).toString('base64')
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: vehicle.refreshToken
            })
          })
          if (refreshRes.ok) {
            const data = await refreshRes.json()
            accessToken = data.access_token
          }
        }

        // Call Smartcar API to disconnect the vehicle
        const disconnectRes = await fetch(`${SMARTCAR_API_URL}/vehicles/${vehicle.smartcarVehicleId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        console.log(`Smartcar disconnect API response: ${disconnectRes.status} for vehicle ${vehicle.smartcarVehicleId}`)
      } catch (apiError) {
        // Log but don't fail - local disconnect should still proceed
        console.error('Smartcar API disconnect failed (continuing with local disconnect):', apiError)
      }
    }

    // Soft-delete: Mark as inactive instead of deleting
    // This preserves historical data for reporting
    await prisma.smartcarVehicle.update({
      where: { id: vehicle.id },
      data: {
        isActive: false,
        disconnectedAt: new Date(),
        // Clear tokens for security
        accessToken: '',
        refreshToken: ''
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Vehicle disconnected successfully',
      vehicleId: vehicle.id
    })

  } catch (error) {
    console.error('Error disconnecting vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect vehicle' },
      { status: 500 }
    )
  }
}

// DELETE /api/smartcar/disconnect - Permanently delete a vehicle record
export async function DELETE(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as a host.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID required' },
        { status: 400 }
      )
    }

    // Find the vehicle
    const vehicle = await prisma.smartcarVehicle.findFirst({
      where: {
        id: vehicleId,
        hostId: host.id
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Permanently delete (cascades to webhooks)
    await prisma.smartcarVehicle.delete({
      where: { id: vehicle.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Vehicle record deleted permanently',
      vehicleId: vehicle.id
    })

  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}
