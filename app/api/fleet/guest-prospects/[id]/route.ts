// app/api/fleet/guest-prospects/[id]/route.ts
// Individual guest prospect operations

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET /api/fleet/guest-prospects/[id] - Get a single guest prospect
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.guestProspect.findUnique({
      where: { id },
      include: {
        convertedProfile: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
            stripeIdentityStatus: true,
            documentsVerified: true,
            creditBalance: true,
            bonusBalance: true,
            depositWalletBalance: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Guest prospect not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      prospect
    })

  } catch (error: any) {
    console.error('[Fleet Guest Prospect API] Get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest prospect' },
      { status: 500 }
    )
  }
}

// PUT /api/fleet/guest-prospects/[id] - Update a guest prospect
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      name,
      email,
      phone,
      notes,
      source,
      creditAmount,
      creditType,
      creditNote,
      creditExpirationDays
    } = body

    // Check if prospect exists
    const existing = await prisma.guestProspect.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Guest prospect not found' },
        { status: 404 }
      )
    }

    // Update the prospect
    const prospect = await prisma.guestProspect.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        email: email ? email.toLowerCase() : existing.email,
        phone: phone ?? existing.phone,
        notes: notes ?? existing.notes,
        source: source ?? existing.source,
        creditAmount: creditAmount ?? existing.creditAmount,
        creditType: creditType ?? existing.creditType,
        creditNote: creditNote ?? existing.creditNote,
        creditExpirationDays: creditExpirationDays ?? existing.creditExpirationDays
      }
    })

    return NextResponse.json({
      success: true,
      prospect
    })

  } catch (error: any) {
    console.error('[Fleet Guest Prospect API] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update guest prospect' },
      { status: 500 }
    )
  }
}

// DELETE /api/fleet/guest-prospects/[id] - Archive a guest prospect
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete (archive)
    const prospect = await prisma.guestProspect.update({
      where: { id },
      data: {
        archivedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      prospect
    })

  } catch (error: any) {
    console.error('[Fleet Guest Prospect API] Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to archive guest prospect' },
      { status: 500 }
    )
  }
}
