// app/api/partner/requests/clear/route.ts
// Partner API to clear (withdraw) all active claims for a host

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth (same pattern as requests/route.ts)
async function getCurrentHost(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
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
      }
    })
  } catch {
    return null
  }
}

// DELETE /api/partner/requests/clear - Withdraw all active claims for the host
export async function DELETE(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find all active claims for this host (PENDING_CAR or CAR_SELECTED)
    const activeClaims = await prisma.requestClaim.findMany({
      where: {
        hostId: host.id,
        status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
      },
      select: {
        id: true,
        requestId: true,
      }
    })

    if (activeClaims.length === 0) {
      return NextResponse.json({
        success: true,
        cleared: 0,
        message: 'No active claims to clear'
      })
    }

    // Withdraw all active claims in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update all active claims to WITHDRAWN
      const updated = await tx.requestClaim.updateMany({
        where: {
          hostId: host.id,
          status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
        },
        data: {
          status: 'WITHDRAWN'
        }
      })

      // For any requests that were CLAIMED (only this host had claimed),
      // set them back to OPEN so other hosts can claim them
      const requestIds = activeClaims.map(c => c.requestId)
      for (const requestId of requestIds) {
        // Check if there are any remaining active claims on this request
        const remainingClaims = await tx.requestClaim.count({
          where: {
            requestId,
            status: { in: ['PENDING_CAR', 'CAR_SELECTED'] }
          }
        })

        // If no active claims remain, reopen the request
        if (remainingClaims === 0) {
          await tx.reservationRequest.updateMany({
            where: {
              id: requestId,
              status: { in: ['CLAIMED', 'CAR_ASSIGNED'] }
            },
            data: { status: 'OPEN' }
          })
        }
      }

      return updated.count
    })

    return NextResponse.json({
      success: true,
      cleared: result
    })

  } catch (error: any) {
    console.error('[Partner Requests Clear API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear requests' },
      { status: 500 }
    )
  }
}
