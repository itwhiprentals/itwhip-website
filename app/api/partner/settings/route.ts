// app/api/partner/settings/route.ts
// Unified Portal - Partner Settings API
// Supports all host types in the unified portal

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

// UNIFIED PORTAL: Helper to get host from any token type
async function getHostFromToken() {
  const cookieStore = await cookies()

  // Accept partner_token, hostAccessToken, or accessToken
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value ||
                cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    if (!hostId) return null
    return hostId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const hostId = await getHostFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: { user: true }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Determine Stripe Connect status
    let stripeConnectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted' = 'not_connected'
    if (partner.stripeConnectAccountId) {
      if (partner.stripeChargesEnabled && partner.stripePayoutsEnabled) {
        stripeConnectStatus = 'connected'
      } else if (partner.stripeDetailsSubmitted) {
        stripeConnectStatus = 'restricted' // Details submitted but not fully enabled
      } else {
        stripeConnectStatus = 'pending'
      }
    }

    // Get vehicle count for tier calculation
    const vehicleCount = await prisma.rentalCar.count({
      where: { hostId: partner.id }
    })

    // Calculate tier based on fleet size
    const commissionRate = partner.currentCommissionRate || 0.25
    let tier = 'Standard'
    if (vehicleCount >= 100) tier = 'Diamond'
    else if (vehicleCount >= 50) tier = 'Platinum'
    else if (vehicleCount >= 10) tier = 'Gold'

    return NextResponse.json({
      success: true,
      partner: {
        businessAddress: partner.address || '',
        businessCity: partner.city || '',
        businessState: partner.state || '',
        businessZipCode: partner.zipCode || ''
      },
      tier: {
        name: tier,
        commissionRate,
        fleetSize: vehicleCount
      },
      settings: {
        email: partner.email,
        firstName: partner.user?.name?.split(' ')[0] || '',
        lastName: partner.user?.name?.split(' ').slice(1).join(' ') || '',
        phone: partner.phone || '',
        companyName: partner.partnerCompanyName || '',
        businessType: 'fleet',
        taxId: '',
        address: partner.address || '',
        city: partner.city || '',
        state: partner.state || '',
        zipCode: partner.zipCode || '',
        // Stripe Connect status
        stripeConnectStatus,
        stripeAccountId: partner.stripeConnectAccountId || null,
        payoutSchedule: 'weekly',
        bankConnected: stripeConnectStatus === 'connected',
        twoFactorEnabled: partner.user?.twoFactorEnabled || false,
        emailNotifications: true,
        smsNotifications: false,
        bookingAlerts: true,
        payoutAlerts: true,
        marketingEmails: false,
        // GDPR fields
        userStatus: partner.user?.status || 'ACTIVE',
        deletionScheduledFor: partner.user?.deletionScheduledFor || null
      }
    })
  } catch (error) {
    console.error('[Partner Settings] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const hostId = await getHostFromToken()

    if (!hostId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update partner settings
    await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        partnerCompanyName: body.companyName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Partner Settings] Error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
