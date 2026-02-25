// app/api/partner/requests/route.ts
// Partner API for hosts to view open reservation requests

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost(request: NextRequest) {
  // Check Authorization header first (mobile app), then fall back to cookies
  const authHeader = request.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    // Check multiple token sources - onboard/validate sets hostAccessToken and accessToken
    token = cookieStore.get('partner_token')?.value
      || cookieStore.get('hostAccessToken')?.value
      || cookieStore.get('accessToken')?.value
  }

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        state: true,
        approvalStatus: true
      }
    })
  } catch {
    return null
  }
}

// GET /api/partner/requests - Get open requests for hosts
export async function GET(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const vehicleType = searchParams.get('vehicleType')
    const myClaims = searchParams.get('myClaims') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build visibility filter: only show requests that are either
    // open marketplace (no linked prospects) or targeted to current host
    const visibilityFilter = {
      OR: [
        { invitedProspects: { none: {} } },
        { invitedProspects: { some: { convertedHostId: host.id } } }
      ]
    }

    // Get counts for stats
    const [openCount, myClaimsCount, myActiveClaimCount] = await Promise.all([
      prisma.reservationRequest.count({
        where: {
          status: 'OPEN',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ],
          AND: [visibilityFilter]
        }
      }),
      prisma.requestClaim.count({
        where: { hostId: host.id }
      }),
      prisma.requestClaim.count({
        where: {
          hostId: host.id,
          status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
        }
      })
    ])

    // Get my active claims for the dashboard card warning
    const myActiveClaims = await prisma.requestClaim.findMany({
      where: {
        hostId: host.id,
        status: 'PENDING_CAR'
      },
      select: {
        id: true,
        requestId: true,
        status: true,
        claimExpiresAt: true,
        request: {
          select: {
            id: true,
            vehicleMake: true,
            vehicleType: true,
            offeredRate: true
          }
        }
      }
    })

    // If myClaims filter, get requests where host has claims
    if (myClaims) {
      const claimedRequests = await prisma.reservationRequest.findMany({
        where: {
          claims: {
            some: { hostId: host.id }
          }
        },
        select: {
          id: true,
          requestCode: true,
          requestType: true,
          guestName: true,
          vehicleType: true,
          vehicleMake: true,
          vehicleModel: true,
          quantity: true,
          startDate: true,
          endDate: true,
          durationDays: true,
          pickupCity: true,
          pickupState: true,
          offeredRate: true,
          totalBudget: true,
          isNegotiable: true,
          status: true,
          priority: true,
          guestNotes: true,
          viewCount: true,
          createdAt: true,
          claims: {
            where: { hostId: host.id },
            select: {
              id: true,
              status: true,
              claimExpiresAt: true,
              carId: true,
              offeredRate: true,
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })

      const transformedClaimed = claimedRequests.map(r => ({
        ...r,
        myClaim: r.claims[0] || null,
        claims: undefined
      }))

      return NextResponse.json({
        success: true,
        requests: transformedClaimed,
        openCount,
        myClaimsCount,
        myActiveClaimCount,
        myClaims: myActiveClaims
      })
    }

    // Build where clause - only show OPEN requests visible to this host
    const where: any = {
      status: 'OPEN',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ],
      AND: [visibilityFilter]
    }

    // Optional filters
    if (city) {
      where.pickupCity = { contains: city, mode: 'insensitive' }
    }
    if (vehicleType) {
      where.AND.push({
        OR: [
          { vehicleType: { contains: vehicleType, mode: 'insensitive' } },
          { vehicleMake: { contains: vehicleType, mode: 'insensitive' } }
        ]
      })
    }

    // Get requests with claim info for this host
    const [requests, total] = await Promise.all([
      prisma.reservationRequest.findMany({
        where,
        select: {
          id: true,
          requestCode: true,
          requestType: true,
          guestName: true,
          companyName: true,
          vehicleType: true,
          vehicleClass: true,
          vehicleMake: true,
          vehicleModel: true,
          quantity: true,
          startDate: true,
          endDate: true,
          durationDays: true,
          pickupCity: true,
          pickupState: true,
          offeredRate: true,
          totalBudget: true,
          isNegotiable: true,
          status: true,
          priority: true,
          guestNotes: true,
          viewCount: true,
          claimAttempts: true,
          createdAt: true,
          expiresAt: true,
          // Check if this host has already claimed
          claims: {
            where: { hostId: host.id },
            select: {
              id: true,
              status: true,
              claimExpiresAt: true,
              carId: true
            }
          },
          // Count of active claims from other hosts
          _count: {
            select: {
              claims: {
                where: {
                  status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
                }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.reservationRequest.count({ where })
    ])

    // Increment view count for retrieved requests (only for regular list, not myClaims)
    const requestIds = requests.map(r => r.id)
    if (requestIds.length > 0) {
      await prisma.reservationRequest.updateMany({
        where: { id: { in: requestIds } },
        data: { viewCount: { increment: 1 } }
      })
    }

    // Transform response
    const transformedRequests = requests.map(r => ({
      ...r,
      myClaim: r.claims[0] || null,
      activeClaims: r._count.claims,
      claims: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      success: true,
      requests: transformedRequests,
      openCount,
      myClaimsCount,
      myActiveClaimCount,
      myClaims: myActiveClaims,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error: any) {
    console.error('[Partner Requests API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
