// app/api/host/fleet-manager-settings/route.ts
// API for managing fleet manager settings

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await verifyRequest(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get host profile
    const host = await prisma.rentalHost.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        isHostManager: true,
        managesOwnCars: true,
        managesOthersCars: true,
        hostManagerSlug: true,
        hostManagerName: true,
        hostManagerBio: true,
        hostManagerLogo: true,
        _count: {
          select: {
            vehicles: true,
            managedVehicles: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      settings: {
        isHostManager: host.isHostManager || false,
        managesOwnCars: host.managesOwnCars ?? true,
        managesOthersCars: host.managesOthersCars || false,
        hostManagerSlug: host.hostManagerSlug,
        hostManagerName: host.hostManagerName,
        hostManagerBio: host.hostManagerBio,
        hostManagerLogo: host.hostManagerLogo,
        ownedVehicleCount: host._count.vehicles,
        managedVehicleCount: host._count.managedVehicles
      }
    })
  } catch (error) {
    console.error('Error fetching fleet manager settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await verifyRequest(request)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      isHostManager,
      managesOwnCars,
      managesOthersCars,
      hostManagerSlug,
      hostManagerName,
      hostManagerBio,
      hostManagerLogo
    } = body

    // Get host profile
    const host = await prisma.rentalHost.findUnique({
      where: { email: user.email },
      select: { id: true, hostManagerSlug: true }
    })

    if (!host) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Validate slug if being set
    if (hostManagerSlug && hostManagerSlug !== host.hostManagerSlug) {
      // Check slug format
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(hostManagerSlug)) {
        return NextResponse.json(
          { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
          { status: 400 }
        )
      }

      if (hostManagerSlug.length < 3) {
        return NextResponse.json(
          { error: 'Slug must be at least 3 characters' },
          { status: 400 }
        )
      }

      if (hostManagerSlug.length > 50) {
        return NextResponse.json(
          { error: 'Slug must be less than 50 characters' },
          { status: 400 }
        )
      }

      // Check if slug is available
      const existingSlug = await prisma.rentalHost.findFirst({
        where: {
          hostManagerSlug: hostManagerSlug,
          id: { not: host.id }
        }
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'This URL is already taken' },
          { status: 400 }
        )
      }
    }

    // Update host profile
    const updatedHost = await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        isHostManager: isHostManager ?? false,
        managesOwnCars: managesOwnCars ?? true,
        managesOthersCars: managesOthersCars ?? false,
        hostManagerSlug: hostManagerSlug || null,
        hostManagerName: hostManagerName || null,
        hostManagerBio: hostManagerBio || null,
        hostManagerLogo: hostManagerLogo || null
      },
      select: {
        id: true,
        isHostManager: true,
        managesOwnCars: true,
        managesOthersCars: true,
        hostManagerSlug: true,
        hostManagerName: true,
        hostManagerBio: true,
        hostManagerLogo: true
      }
    })

    return NextResponse.json({
      success: true,
      settings: updatedHost
    })
  } catch (error) {
    console.error('Error updating fleet manager settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
