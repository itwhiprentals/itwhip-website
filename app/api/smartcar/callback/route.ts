// app/api/smartcar/callback/route.ts
// Handle Smartcar OAuth callback - exchange code for tokens and save vehicles

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Smartcar API configuration
const SMARTCAR_CLIENT_ID = process.env.SMARTCAR_CLIENT_ID
const SMARTCAR_CLIENT_SECRET = process.env.SMARTCAR_CLIENT_SECRET
const SMARTCAR_REDIRECT_URI = process.env.SMARTCAR_REDIRECT_URI || 'https://itwhip.com/api/smartcar/callback'

// Smartcar API base URL
const SMARTCAR_API_URL = 'https://api.smartcar.com/v2.0'
const SMARTCAR_AUTH_URL = 'https://auth.smartcar.com/oauth/token'

interface SmartcarTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

interface SmartcarVehicleInfo {
  id: string
  make: string
  model: string
  year: number
}

interface SmartcarVinResponse {
  vin: string
}

// Exchange authorization code for access tokens
async function exchangeCodeForTokens(code: string): Promise<SmartcarTokenResponse> {
  const auth = Buffer.from(`${SMARTCAR_CLIENT_ID}:${SMARTCAR_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(SMARTCAR_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SMARTCAR_REDIRECT_URI
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

// Get list of vehicle IDs the user authorized
async function getVehicleIds(accessToken: string): Promise<string[]> {
  const response = await fetch(`${SMARTCAR_API_URL}/vehicles`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get vehicles: ${error}`)
  }

  const data = await response.json()
  return data.vehicles || []
}

// Get vehicle info (make, model, year)
async function getVehicleInfo(vehicleId: string, accessToken: string): Promise<SmartcarVehicleInfo> {
  const response = await fetch(`${SMARTCAR_API_URL}/vehicles/${vehicleId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get vehicle info: ${error}`)
  }

  return response.json()
}

// Get vehicle VIN
async function getVehicleVin(vehicleId: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${SMARTCAR_API_URL}/vehicles/${vehicleId}/vin`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      console.warn(`Failed to get VIN for vehicle ${vehicleId}`)
      return null
    }

    const data: SmartcarVinResponse = await response.json()
    return data.vin
  } catch (error) {
    console.warn(`Error getting VIN for vehicle ${vehicleId}:`, error)
    return null
  }
}

// GET /api/smartcar/callback - Handle OAuth redirect from Smartcar
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Build redirect URL for success/error
  const baseRedirectUrl = '/partner/tracking'

  // Handle error from Smartcar
  if (error) {
    console.error('Smartcar OAuth error:', error, errorDescription)
    const redirectUrl = new URL(baseRedirectUrl, request.url)
    redirectUrl.searchParams.set('smartcar_error', error)
    if (errorDescription) {
      redirectUrl.searchParams.set('smartcar_error_description', errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Validate required params
  if (!code || !state) {
    const redirectUrl = new URL(baseRedirectUrl, request.url)
    redirectUrl.searchParams.set('smartcar_error', 'missing_params')
    return NextResponse.redirect(redirectUrl)
  }

  // Validate configuration
  if (!SMARTCAR_CLIENT_ID || !SMARTCAR_CLIENT_SECRET) {
    console.error('Smartcar not configured')
    const redirectUrl = new URL(baseRedirectUrl, request.url)
    redirectUrl.searchParams.set('smartcar_error', 'not_configured')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Decode state to get hostId
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    const { hostId, timestamp } = stateData

    // Validate state timestamp (15 minute expiry)
    const stateAge = Date.now() - timestamp
    if (stateAge > 15 * 60 * 1000) {
      const redirectUrl = new URL(baseRedirectUrl, request.url)
      redirectUrl.searchParams.set('smartcar_error', 'state_expired')
      return NextResponse.redirect(redirectUrl)
    }

    // Verify host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!host) {
      const redirectUrl = new URL(baseRedirectUrl, request.url)
      redirectUrl.searchParams.set('smartcar_error', 'invalid_host')
      return NextResponse.redirect(redirectUrl)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Get list of authorized vehicle IDs
    const vehicleIds = await getVehicleIds(tokens.access_token)

    if (vehicleIds.length === 0) {
      const redirectUrl = new URL(baseRedirectUrl, request.url)
      redirectUrl.searchParams.set('smartcar_error', 'no_vehicles')
      return NextResponse.redirect(redirectUrl)
    }

    // Process each vehicle
    const connectedVehicles = []
    for (const smartcarVehicleId of vehicleIds) {
      try {
        // Get vehicle info
        const vehicleInfo = await getVehicleInfo(smartcarVehicleId, tokens.access_token)
        const vin = await getVehicleVin(smartcarVehicleId, tokens.access_token)

        // Check if already connected (by Smartcar vehicle ID)
        const existing = await prisma.smartcarVehicle.findUnique({
          where: { smartcarVehicleId }
        })

        if (existing) {
          // Update existing record with new tokens
          await prisma.smartcarVehicle.update({
            where: { id: existing.id },
            data: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              tokenExpiresAt,
              isActive: true,
              disconnectedAt: null,
              // Update vehicle info in case it changed
              make: vehicleInfo.make,
              model: vehicleInfo.model,
              year: vehicleInfo.year,
              vin: vin || existing.vin
            }
          })
          connectedVehicles.push({
            id: existing.id,
            smartcarVehicleId,
            make: vehicleInfo.make,
            model: vehicleInfo.model,
            year: vehicleInfo.year,
            status: 'reconnected'
          })
        } else {
          // Try to match to existing RentalCar by VIN
          let carId: string | null = null
          if (vin) {
            const matchedCar = await prisma.rentalCar.findFirst({
              where: {
                hostId: host.id,
                vin: vin
              }
            })
            if (matchedCar) {
              carId = matchedCar.id
            }
          }

          // Create new SmartcarVehicle record
          const newVehicle = await prisma.smartcarVehicle.create({
            data: {
              hostId: host.id,
              carId,
              smartcarVehicleId,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              tokenExpiresAt,
              vin,
              make: vehicleInfo.make,
              model: vehicleInfo.model,
              year: vehicleInfo.year,
              isActive: true
            }
          })

          connectedVehicles.push({
            id: newVehicle.id,
            smartcarVehicleId,
            make: vehicleInfo.make,
            model: vehicleInfo.model,
            year: vehicleInfo.year,
            status: 'connected'
          })
        }
      } catch (vehicleError) {
        console.error(`Error processing vehicle ${smartcarVehicleId}:`, vehicleError)
        // Continue with other vehicles
      }
    }

    // Redirect back to tracking page with success
    const redirectUrl = new URL(baseRedirectUrl, request.url)
    redirectUrl.searchParams.set('smartcar_success', 'true')
    redirectUrl.searchParams.set('smartcar_vehicles_connected', connectedVehicles.length.toString())
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Smartcar callback error:', error)
    const redirectUrl = new URL(baseRedirectUrl, request.url)
    redirectUrl.searchParams.set('smartcar_error', 'processing_failed')
    return NextResponse.redirect(redirectUrl)
  }
}
