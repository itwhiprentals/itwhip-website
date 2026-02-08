// app/api/host/claims/[id]/edit-description/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { validateDescription } from '@/lib/validation/claimValidation'

// POST /api/host/claims/[id]/edit-description - Edit claim description
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get host ID from middleware
    const hostId = request.headers.get('x-host-id')

    if (!hostId) {
      return NextResponse.json(
        { error: 'Unauthorized - Host ID not found' },
        { status: 401 }
      )
    }

    const { id: claimId } = await params

    // Parse request body
    const body = await request.json()
    const { description } = body

    // Validate description
    const validationError = validateDescription(description)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // Find claim and verify ownership
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        hostId: true,
        description: true,
        status: true
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (claim.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this claim.' },
        { status: 403 }
      )
    }

    // Check if claim is locked (can only edit PENDING claims)
    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { 
          error: 'This claim cannot be edited anymore. Only pending claims can be modified.',
          locked: true,
          status: claim.status
        },
        { status: 403 }
      )
    }

    // Check if description actually changed
    if (claim.description.trim() === description.trim()) {
      return NextResponse.json(
        { 
          error: 'No changes detected. The description is the same.',
          noChange: true
        },
        { status: 400 }
      )
    }

    // Create edit record for audit trail
    const edit = await prisma.claimEdit.create({
      data: {
        id: crypto.randomUUID(),
        claimId: claim.id,
        fieldChanged: 'description',
        oldValue: claim.description,
        newValue: description.trim(),
        editedBy: hostId,
        editedByType: 'HOST'
      }
    })

    // Update claim description
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        description: description.trim(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        description: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Description updated successfully',
      claim: updatedClaim,
      edit: {
        id: edit.id,
        editedAt: edit.editedAt.toISOString(),
        fieldChanged: edit.fieldChanged
      }
    })

  } catch (error) {
    console.error('Error editing claim description:', error)
    return NextResponse.json(
      { error: 'Failed to update claim description' },
      { status: 500 }
    )
  }
}