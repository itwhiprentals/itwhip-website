// app/api/host/account-type/route.ts
// GET /api/host/account-type - Returns user's account type flags and counts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { AccountTypeResponse } from '@/app/types/fleet-management'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check for guest profile
    const guestProfile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: { id: true }
    })

    // Check for host profile
    const hostProfile = await prisma.rentalHost.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email }
        ]
      },
      select: {
        id: true,
        hostType: true,
        isHostManager: true,
        isVehicleOwner: true,
        hostManagerSlug: true,
        managesOwnCars: true,
        managesOthersCars: true,
        partnerSlug: true
      }
    })

    // Default response
    const response: AccountTypeResponse = {
      isGuest: !!guestProfile,
      isHost: !!hostProfile,
      isHostManager: false,
      isVehicleOwner: false,
      isPartner: false,
      ownedVehicleCount: 0,
      managedVehicleCount: 0,
      ownedManagedVehicleCount: 0
    }

    if (hostProfile) {
      response.isHostManager = hostProfile.isHostManager || false
      response.isVehicleOwner = hostProfile.isVehicleOwner || false
      response.isPartner = ['FLEET_PARTNER', 'PARTNER'].includes(hostProfile.hostType || '')

      // Count owned vehicles (where hostId = current user)
      response.ownedVehicleCount = await prisma.rentalCar.count({
        where: {
          hostId: hostProfile.id,
          active: true
        }
      })

      // Count managed vehicles (from VehicleManagement where managerId = current user)
      response.managedVehicleCount = await prisma.vehicleManagement.count({
        where: {
          managerId: hostProfile.id,
          status: 'ACTIVE'
        }
      })

      // Count owned vehicles that are managed by others
      response.ownedManagedVehicleCount = await prisma.vehicleManagement.count({
        where: {
          ownerId: hostProfile.id,
          status: 'ACTIVE'
        }
      })

      // Add fleet page URL if host manager with slug
      if (response.isHostManager && hostProfile.hostManagerSlug) {
        response.fleetPageUrl = `/fleet/${hostProfile.hostManagerSlug}`
      }

      // Add partner page URL if partner with slug
      if (response.isPartner && hostProfile.partnerSlug) {
        response.partnerPageUrl = `/rideshare/${hostProfile.partnerSlug}`
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Account Type] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account type' },
      { status: 500 }
    )
  }
}
