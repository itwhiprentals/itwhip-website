// app/api/fleet/prospects/[id]/route.ts
// Admin API for individual host prospect operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET /api/fleet/prospects/[id] - Get a specific prospect
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.hostProspect.findUnique({
      where: { id },
      include: {
        request: {
          select: {
            id: true,
            requestCode: true,
            guestName: true,
            vehicleType: true,
            vehicleMake: true,
            startDate: true,
            endDate: true,
            durationDays: true,
            offeredRate: true,
            totalBudget: true,
            pickupCity: true,
            pickupState: true,
            status: true,
            priority: true
          }
        },
        convertedHost: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePhoto: true,
            city: true,
            state: true,
            approvalStatus: true,
            createdAt: true,
            cars: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                dailyRate: true,
                isActive: true
              },
              take: 5
            }
          }
        }
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      prospect
    })

  } catch (error: any) {
    console.error('[Fleet Prospect API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prospect' },
      { status: 500 }
    )
  }
}

// PATCH /api/fleet/prospects/[id] - Update a prospect
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.hostProspect.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      )
    }

    const {
      name,
      email,
      phone,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleDescription,
      source,
      sourceUrl,
      conversationNotes,
      status,
      requestId
    } = body

    // If changing email, check for duplicates
    if (email && email.toLowerCase() !== existing.email) {
      const duplicate = await prisma.hostProspect.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: id }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'A prospect with this email already exists' },
          { status: 409 }
        )
      }
    }

    const prospect = await prisma.hostProspect.update({
      where: { id },
      data: {
        name,
        email: email?.toLowerCase(),
        phone,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleDescription,
        source,
        sourceUrl,
        conversationNotes,
        status,
        requestId
      },
      include: {
        request: {
          select: {
            id: true,
            requestCode: true,
            guestName: true,
            vehicleMake: true,
            vehicleType: true,
            startDate: true,
            endDate: true,
            durationDays: true,
            offeredRate: true,
            status: true
          }
        },
        convertedHost: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      prospect
    })

  } catch (error: any) {
    console.error('[Fleet Prospect API] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update prospect' },
      { status: 500 }
    )
  }
}

// DELETE /api/fleet/prospects/[id] - Archive or delete a prospect
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const hardDelete = searchParams.get('hard') === 'true'

    const existing = await prisma.hostProspect.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      )
    }

    if (hardDelete) {
      await prisma.hostProspect.delete({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        message: 'Prospect deleted'
      })
    } else {
      // Soft delete - archive
      const prospect = await prisma.hostProspect.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        prospect
      })
    }

  } catch (error: any) {
    console.error('[Fleet Prospect API] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete prospect' },
      { status: 500 }
    )
  }
}
