// app/api/partner/hosts/search/route.ts
// Search for approved hosts that partners can invite to manage their vehicles
// RESTRICTED: Only ItWhip platform partner can search hosts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

// ItWhip platform partner email - only this partner can search hosts
const ITWHIP_PLATFORM_EMAIL = 'nickpattt86@gmail.com'

export async function GET(request: NextRequest) {
  try {
    // Verify partner authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // IMPORTANT: Only ItWhip platform partner can search hosts
    // Other partners must manually enter email addresses
    const isItWhipPartner = user.email.toLowerCase() === ITWHIP_PLATFORM_EMAIL.toLowerCase()
    if (!isItWhipPartner) {
      return NextResponse.json(
        { error: 'Host search is only available to ItWhip platform. Please enter the host email directly.' },
        { status: 403 }
      )
    }

    // Get search query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Get current partner's host ID to exclude from results
    const partnerToken = request.cookies.get('partner_token')?.value
    let currentHostId: string | null = null

    if (partnerToken) {
      // Get the partner's RentalHost record
      const partner = await prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId: user.userId },
            { id: user.userId }
          ]
        },
        select: { id: true }
      })
      currentHostId = partner?.id || null
    }

    // Build search conditions
    const searchConditions = query.length > 0 ? {
      OR: [
        { email: { contains: query, mode: 'insensitive' as const } },
        { name: { contains: query, mode: 'insensitive' as const } },
        { businessName: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {}

    // Build the where clause
    const whereClause = {
      // Must be approved
      approvalStatus: 'APPROVED',
      // Must be active
      active: true,
      // Exclude only partner/pending types (they're owners looking for managers, not managers)
      // Include: REAL, MANAGED, PLATFORM, INDIVIDUAL, etc.
      hostType: {
        notIn: ['FLEET_PARTNER', 'PARTNER', 'PENDING']
      },
      // Exclude current partner
      ...(currentHostId ? { id: { not: currentHostId } } : {}),
      // Apply search filter
      ...searchConditions
    }

    // Search for approved hosts
    const hosts = await prisma.rentalHost.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        businessName: true,
        city: true,
        state: true,
        hostType: true,
        isHostManager: true,
        managesOthersCars: true,
        rating: true,
        totalTrips: true,
        // Count managed vehicles
        _count: {
          select: {
            cars: true,
            managedVehicles: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalTrips: 'desc' },
        { name: 'asc' }
      ],
      take: limit
    })

    // Format response
    const formattedHosts = hosts.map(host => ({
      id: host.id,
      name: host.name,
      email: host.email,
      profilePhoto: host.profilePhoto,
      businessName: host.businessName,
      city: host.city,
      state: host.state,
      hostType: host.hostType,
      isHostManager: host.isHostManager,
      managesOthersCars: host.managesOthersCars,
      rating: host.rating ? Number(host.rating) : null,
      totalTrips: host.totalTrips,
      fleetSize: host._count.cars,
      managedVehicles: host._count.managedVehicles
    }))

    return NextResponse.json({
      success: true,
      hosts: formattedHosts,
      count: formattedHosts.length,
      query
    })

  } catch (error) {
    console.error('[Partner Host Search] Error:', error)
    return NextResponse.json(
      { error: 'Failed to search hosts' },
      { status: 500 }
    )
  }
}
