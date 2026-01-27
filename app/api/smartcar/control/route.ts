// app/api/smartcar/control/route.ts
// Remote control commands for Smartcar-connected vehicles
// Reference: SMARTCAR_AUDIT.md and https://smartcar.com/docs/api/

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const SMARTCAR_API_URL = 'https://api.smartcar.com/v2.0'
const SMARTCAR_CLIENT_ID = process.env.SMARTCAR_CLIENT_ID
const SMARTCAR_CLIENT_SECRET = process.env.SMARTCAR_CLIENT_SECRET
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

// Refresh access token if expired
async function refreshAccessToken(vehicleDbId: string, refreshToken: string): Promise<string | null> {
  if (!SMARTCAR_CLIENT_ID || !SMARTCAR_CLIENT_SECRET) {
    console.error('Smartcar not configured for token refresh')
    return null
  }

  try {
    const auth = Buffer.from(`${SMARTCAR_CLIENT_ID}:${SMARTCAR_CLIENT_SECRET}`).toString('base64')

    const response = await fetch(SMARTCAR_AUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text())
      return null
    }

    const data = await response.json()
    const tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000)

    // Update tokens in database
    await prisma.smartcarVehicle.update({
      where: { id: vehicleDbId },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt
      }
    })

    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

// Get valid access token (refresh if needed)
async function getValidAccessToken(vehicle: {
  id: string
  accessToken: string
  refreshToken: string
  tokenExpiresAt: Date
}): Promise<string | null> {
  // Check if token expires in less than 5 minutes
  const expiresIn = vehicle.tokenExpiresAt.getTime() - Date.now()
  if (expiresIn < 5 * 60 * 1000) {
    return refreshAccessToken(vehicle.id, vehicle.refreshToken)
  }
  return vehicle.accessToken
}

// POST /api/smartcar/control - Execute remote command
// REAL Smartcar API Actions (from SMARTCAR_AUDIT.md):
// - lock/unlock: POST /vehicles/{id}/security with { action: 'LOCK' | 'UNLOCK' }
// - start_charge/stop_charge: POST /vehicles/{id}/charge with { action: 'START' | 'STOP' }
//
// NOT SUPPORTED by Smartcar (need OBD device like Bouncie):
// - Engine start/stop
// - Climate control / Pre-cool
// - Horn / Lights
// - Kill switch
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
    const { vehicleId, action } = body

    if (!vehicleId || !action) {
      return NextResponse.json(
        { error: 'Vehicle ID and action required' },
        { status: 400 }
      )
    }

    // REAL Smartcar API supported actions only
    // See: https://smartcar.com/docs/api/ - Control Endpoints
    const validActions = ['lock', 'unlock', 'start_charge', 'stop_charge']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Smartcar API supports: ${validActions.join(', ')}. Note: Engine start/stop, climate control, and kill switch require OBD hardware (Bouncie).` },
        { status: 400 }
      )
    }

    // Find the vehicle
    const vehicle = await prisma.smartcarVehicle.findFirst({
      where: {
        id: vehicleId,
        hostId: host.id,
        isActive: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Get valid access token
    const accessToken = await getValidAccessToken({
      id: vehicle.id,
      accessToken: vehicle.accessToken,
      refreshToken: vehicle.refreshToken,
      tokenExpiresAt: vehicle.tokenExpiresAt
    })

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Smartcar. Please reconnect the vehicle.' },
        { status: 401 }
      )
    }

    // Build the correct Smartcar API endpoint and payload
    let endpoint: string
    let payload: Record<string, string>

    switch (action) {
      case 'lock':
        // POST /vehicles/{id}/security - requires control_security scope
        endpoint = `/vehicles/${vehicle.smartcarVehicleId}/security`
        payload = { action: 'LOCK' }
        break
      case 'unlock':
        // POST /vehicles/{id}/security - requires control_security scope
        endpoint = `/vehicles/${vehicle.smartcarVehicleId}/security`
        payload = { action: 'UNLOCK' }
        break
      case 'start_charge':
        // POST /vehicles/{id}/charge - requires control_charge scope (EVs only)
        endpoint = `/vehicles/${vehicle.smartcarVehicleId}/charge`
        payload = { action: 'START' }
        break
      case 'stop_charge':
        // POST /vehicles/{id}/charge - requires control_charge scope (EVs only)
        endpoint = `/vehicles/${vehicle.smartcarVehicleId}/charge`
        payload = { action: 'STOP' }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const controlResponse = await fetch(`${SMARTCAR_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!controlResponse.ok) {
      const errorText = await controlResponse.text()
      console.error(`Smartcar control error (${action}):`, errorText)

      // Handle specific Smartcar error codes
      if (controlResponse.status === 409) {
        return NextResponse.json(
          { error: 'Vehicle is not in a state to perform this action (e.g., already locked or not plugged in for charging)' },
          { status: 409 }
        )
      }

      if (controlResponse.status === 501) {
        return NextResponse.json(
          { error: 'This vehicle does not support this command. Lock/unlock requires control_security scope and vehicle compatibility.' },
          { status: 501 }
        )
      }

      if (controlResponse.status === 403) {
        return NextResponse.json(
          { error: 'Permission denied. Make sure the vehicle was connected with the required scope (control_security for lock/unlock, control_charge for charging).' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: `Failed to ${action} vehicle. The vehicle may not support this feature.` },
        { status: 500 }
      )
    }

    // Log the successful action
    console.log(`[Smartcar Control] Host ${host.id} executed ${action} on vehicle ${vehicle.smartcarVehicleId}`)

    // Return human-readable success message
    const actionMessages: Record<string, string> = {
      lock: 'Vehicle doors locked successfully',
      unlock: 'Vehicle doors unlocked successfully',
      start_charge: 'Charging started successfully',
      stop_charge: 'Charging stopped successfully'
    }

    return NextResponse.json({
      success: true,
      action,
      vehicleId: vehicle.id,
      message: actionMessages[action] || `${action} command sent successfully`
    })

  } catch (error) {
    console.error('Error executing vehicle control:', error)
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    )
  }
}

// GET /api/smartcar/control - Get available actions for a vehicle
export async function GET(request: NextRequest) {
  return NextResponse.json({
    availableActions: {
      smartcar: {
        lock: {
          description: 'Lock vehicle doors',
          scope: 'control_security',
          supportedVehicles: 'Most brands (check compatibility)'
        },
        unlock: {
          description: 'Unlock vehicle doors',
          scope: 'control_security',
          supportedVehicles: 'Most brands (check compatibility)'
        },
        start_charge: {
          description: 'Start EV charging',
          scope: 'control_charge',
          supportedVehicles: 'EVs only (Tesla, BMW, etc.)'
        },
        stop_charge: {
          description: 'Stop EV charging',
          scope: 'control_charge',
          supportedVehicles: 'EVs only (Tesla, BMW, etc.)'
        }
      },
      notSupportedBySmartcar: [
        'Engine start/stop - Requires OBD hardware (Bouncie)',
        'Climate control / Pre-cool - Requires OBD or native app',
        'Horn / Lights - Requires OBD hardware',
        'Kill switch - Requires OBD hardware (Bouncie)',
        'Real-time speed alerts - Requires OBD hardware'
      ]
    },
    documentation: 'https://smartcar.com/docs/api/'
  })
}
