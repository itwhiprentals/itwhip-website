// app/api/smartcar/vehicles/route.ts
// List and manage Smartcar-connected vehicles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
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

// Refresh access token if expired
async function refreshAccessToken(vehicleId: string, refreshToken: string): Promise<string | null> {
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
      where: { id: vehicleId },
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

// Fetch live data from Smartcar for a vehicle
async function fetchLiveData(smartcarVehicleId: string, accessToken: string) {
  const data: {
    location?: { latitude: number; longitude: number } | null
    odometer?: number | null
    fuel?: number | null
    battery?: number | null
    tirePressure?: { frontLeft: number; frontRight: number; backLeft: number; backRight: number } | null
    oilLife?: number | null
    chargeState?: { isPluggedIn: boolean; state: 'CHARGING' | 'FULLY_CHARGED' | 'NOT_CHARGING' | null } | null
  } = {}

  // Fetch location
  try {
    const locResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/location`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (locResponse.ok) {
      const locData = await locResponse.json()
      data.location = {
        latitude: locData.latitude,
        longitude: locData.longitude
      }
    }
  } catch (e) {
    console.warn('Failed to fetch location:', e)
  }

  // Fetch odometer
  try {
    const odoResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/odometer`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (odoResponse.ok) {
      const odoData = await odoResponse.json()
      data.odometer = odoData.distance // in kilometers, will convert
    }
  } catch (e) {
    console.warn('Failed to fetch odometer:', e)
  }

  // Fetch fuel (for ICE vehicles)
  try {
    const fuelResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/fuel`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (fuelResponse.ok) {
      const fuelData = await fuelResponse.json()
      data.fuel = fuelData.percentRemaining * 100 // Convert to percentage
    }
  } catch (e) {
    // Expected to fail for EVs
  }

  // Fetch battery (for EVs)
  try {
    const batteryResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/battery`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (batteryResponse.ok) {
      const batteryData = await batteryResponse.json()
      data.battery = batteryData.percentRemaining * 100 // Convert to percentage
    }
  } catch (e) {
    // Expected to fail for ICE vehicles
  }

  // Fetch tire pressure
  try {
    const tireResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/tires/pressure`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (tireResponse.ok) {
      const tireData = await tireResponse.json()
      // Convert kPa to PSI (1 kPa = 0.145038 PSI)
      const kpaToPsi = (kpa: number) => Math.round(kpa * 0.145038)
      data.tirePressure = {
        frontLeft: kpaToPsi(tireData.frontLeft),
        frontRight: kpaToPsi(tireData.frontRight),
        backLeft: kpaToPsi(tireData.backLeft),
        backRight: kpaToPsi(tireData.backRight)
      }
    }
  } catch (e) {
    // Tire pressure not available for all vehicles
  }

  // Fetch oil life (for ICE vehicles)
  try {
    const oilResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/engine/oil`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (oilResponse.ok) {
      const oilData = await oilResponse.json()
      data.oilLife = oilData.lifeRemaining * 100 // Convert to percentage
    }
  } catch (e) {
    // Oil life not available for EVs
  }

  // Fetch charge state (for EVs)
  try {
    const chargeResponse = await fetch(`${SMARTCAR_API_URL}/vehicles/${smartcarVehicleId}/charge`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (chargeResponse.ok) {
      const chargeData = await chargeResponse.json()
      data.chargeState = {
        isPluggedIn: chargeData.isPluggedIn ?? false,
        state: chargeData.state || null // 'CHARGING' | 'FULLY_CHARGED' | 'NOT_CHARGING'
      }
    }
  } catch (e) {
    // Charge state not available for ICE vehicles
  }

  return data
}

// GET /api/smartcar/vehicles - List connected vehicles
export async function GET(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as a host.' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const includeRealTime = searchParams.get('realtime') === 'true'
    const vehicleIdFilter = searchParams.get('vehicleId')

    // Build query
    const whereClause: { hostId: string; isActive: boolean; id?: string } = {
      hostId: host.id,
      isActive: true
    }

    if (vehicleIdFilter) {
      whereClause.id = vehicleIdFilter
    }

    // Get vehicles from database
    const vehicles = await prisma.smartcarVehicle.findMany({
      where: whereClause,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            photos: {
              where: { isHero: true },
              take: 1,
              select: { url: true }
            }
          }
        }
      },
      orderBy: { connectedAt: 'desc' }
    })

    // If real-time data requested, fetch from Smartcar
    if (includeRealTime && vehicles.length > 0) {
      const vehiclesWithRealTime = await Promise.all(
        vehicles.map(async (vehicle) => {
          try {
            const accessToken = await getValidAccessToken({
              id: vehicle.id,
              accessToken: vehicle.accessToken,
              refreshToken: vehicle.refreshToken,
              tokenExpiresAt: vehicle.tokenExpiresAt
            })

            if (!accessToken) {
              return {
                ...vehicle,
                accessToken: undefined, // Don't expose tokens
                refreshToken: undefined,
                realTimeData: null,
                realTimeError: 'Token refresh failed'
              }
            }

            const liveData = await fetchLiveData(vehicle.smartcarVehicleId, accessToken)

            // Update cached data in database
            await prisma.smartcarVehicle.update({
              where: { id: vehicle.id },
              data: {
                lastSyncAt: new Date(),
                lastLocation: liveData.location
                  ? {
                      lat: liveData.location.latitude,
                      lng: liveData.location.longitude,
                      timestamp: new Date().toISOString()
                    }
                  : undefined, // Keep existing value
                lastOdometer: liveData.odometer
                  ? liveData.odometer * 0.621371 // Convert km to miles
                  : undefined,
                lastFuel: liveData.fuel ?? undefined,
                lastBattery: liveData.battery ?? undefined,
                lastTirePressure: liveData.tirePressure ?? undefined,
                lastOilLife: liveData.oilLife ?? undefined,
                lastChargeState: liveData.chargeState ?? undefined
              }
            })

            return {
              ...vehicle,
              accessToken: undefined,
              refreshToken: undefined,
              // Include new data fields
              lastTirePressure: liveData.tirePressure ?? vehicle.lastTirePressure,
              lastOilLife: liveData.oilLife ?? vehicle.lastOilLife,
              lastChargeState: liveData.chargeState ?? vehicle.lastChargeState,
              realTimeData: {
                location: liveData.location,
                odometer: liveData.odometer ? liveData.odometer * 0.621371 : null, // miles
                fuel: liveData.fuel,
                battery: liveData.battery,
                tirePressure: liveData.tirePressure,
                oilLife: liveData.oilLife,
                chargeState: liveData.chargeState,
                fetchedAt: new Date().toISOString()
              }
            }
          } catch (error) {
            console.error(`Error fetching real-time data for vehicle ${vehicle.id}:`, error)
            return {
              ...vehicle,
              accessToken: undefined,
              refreshToken: undefined,
              realTimeData: null,
              realTimeError: 'Failed to fetch data'
            }
          }
        })
      )

      return NextResponse.json({
        vehicles: vehiclesWithRealTime,
        count: vehiclesWithRealTime.length
      })
    }

    // Return cached data (no tokens)
    const sanitizedVehicles = vehicles.map(v => ({
      ...v,
      accessToken: undefined,
      refreshToken: undefined
    }))

    return NextResponse.json({
      vehicles: sanitizedVehicles,
      count: sanitizedVehicles.length
    })

  } catch (error) {
    console.error('Error fetching Smartcar vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}
