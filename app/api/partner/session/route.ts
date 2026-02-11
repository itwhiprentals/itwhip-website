// app/api/partner/session/route.ts
// Unified Portal Session API - Check authentication and get user data with role
// Supports both partner_token and hostAccessToken cookies for unified portal

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

// Compute user role from host flags
type UserRole = 'fleet_partner' | 'hybrid' | 'fleet_manager' | 'vehicle_owner' | 'individual'

function computeRole(host: {
  hostType: string
  isHostManager: boolean
  managesOwnCars: boolean
  isVehicleOwner: boolean
}): UserRole {
  // Fleet partner (company-level access)
  if (host.hostType === 'FLEET_PARTNER') {
    return 'fleet_partner'
  }

  // Hybrid: manages own cars AND manages others
  if (host.isHostManager && host.managesOwnCars) {
    return 'hybrid'
  }

  // Fleet manager only: manages others' vehicles
  if (host.isHostManager) {
    return 'fleet_manager'
  }

  // Vehicle owner: passive income, read-only
  if (host.isVehicleOwner && !host.managesOwnCars) {
    return 'vehicle_owner'
  }

  // Default: individual host managing own cars
  return 'individual'
}

export async function GET(request: NextRequest) {
  try {
    // Check Authorization header first (mobile app)
    const authHeader = request.headers.get('authorization')
    let token: string | undefined
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    // Fall back to cookies (web)
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('partner_token')?.value ||
              cookieStore.get('hostAccessToken')?.value ||
              cookieStore.get('accessToken')?.value
    }

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No session found' },
        { status: 401 }
      )
    }

    // Verify token
    let payload
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch (error) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Get host ID from token (supports both token formats)
    const hostId = payload.hostId as string
    if (!hostId) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid token format' },
        { status: 401 }
      )
    }

    // Fetch host data with all role-related fields
    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePhoto: true,
        hostType: true,
        approvalStatus: true,
        active: true,
        // Role flags
        isHostManager: true,
        managesOwnCars: true,
        managesOthersCars: true,
        isVehicleOwner: true,
        // Permissions
        dashboardAccess: true,
        canViewBookings: true,
        canEditCalendar: true,
        canSetPricing: true,
        canMessageGuests: true,
        canWithdrawFunds: true,
        // Partner-specific
        partnerCompanyName: true,
        partnerSlug: true,
        partnerLogo: true,
        partnerBio: true,
        partnerSupportEmail: true,
        partnerSupportPhone: true,
        currentCommissionRate: true,
        partnerFleetSize: true,
        partnerTotalBookings: true,
        partnerTotalRevenue: true,
        partnerAvgRating: true,
        // Fleet manager specific
        hostManagerSlug: true,
        hostManagerName: true,
        hostManagerLogo: true,
        // Service settings for publishing status
        enableRideshare: true,
        enableRentals: true,
        // Banking
        stripeConnectAccountId: true,
        // Verification
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        identityVerified: true,
        documentsVerified: true,
        createdAt: true
      }
    })

    if (!partner) {
      return NextResponse.json(
        { authenticated: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    // Check if account is suspended
    if (partner.approvalStatus === 'SUSPENDED') {
      return NextResponse.json(
        { authenticated: false, error: 'Account suspended' },
        { status: 403 }
      )
    }

    // Compute role from flags
    const role = computeRole({
      hostType: partner.hostType,
      isHostManager: partner.isHostManager,
      managesOwnCars: partner.managesOwnCars,
      isVehicleOwner: partner.isVehicleOwner
    })

    // Get vehicle count for this host
    const vehicleCount = await prisma.rentalCar.count({
      where: { hostId: partner.id }
    })

    // Get active vehicle count for publishing status
    const activeVehicleCount = await prisma.rentalCar.count({
      where: { hostId: partner.id, isActive: true }
    })

    // Get managed vehicle count (for fleet managers)
    // Query through VehicleManagement table where this partner is the manager
    const managedCount = partner.isHostManager ? await prisma.vehicleManagement.count({
      where: {
        managerId: partner.id
      }
    }) : 0

    // Calculate publishing status for landing page
    const hasApproval = partner.approvalStatus === 'APPROVED'
    const hasValidSlug = !!partner.partnerSlug && partner.partnerSlug !== 'your-company-slug'
    const hasActiveVehicles = activeVehicleCount > 0
    const hasService = partner.enableRideshare || partner.enableRentals
    const isLandingPagePublished = hasApproval && hasValidSlug && hasActiveVehicles && hasService

    return NextResponse.json({
      authenticated: true,
      partner: {
        ...partner,
        // Computed fields
        role,
        vehicleCount,
        activeVehicleCount,
        managedVehicleCount: managedCount,
        // Display name (prefer company name for partners)
        displayName: partner.partnerCompanyName || partner.hostManagerName || partner.name,
        // Public slug (prefer partner slug, then manager slug)
        publicSlug: partner.partnerSlug || partner.hostManagerSlug || null,
        // Landing page publishing status
        isLandingPagePublished
      }
    })

  } catch (error: any) {
    console.error('[Partner Session] Error:', error)
    return NextResponse.json(
      { authenticated: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}
