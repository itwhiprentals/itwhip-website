// app/api/fleet/guests/[id]/verify-insurance/route.ts
// ✅ ADMIN ENDPOINT: Verify Guest Insurance
// POST /api/fleet/guests/[id]/verify-insurance?key=phoenix-fleet-2847
// Sets insuranceVerified = true and creates VERIFIED history entry

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// ============================================================================
// POST: Admin verifies guest insurance
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet authentication
    const searchParams = request.nextUrl.searchParams
    const urlKey = searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const fleetKey = urlKey || headerKey

    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid fleet key' },
        { status: 401 }
      )
    }

    const { id: guestId } = await params

    // Get verification notes from request (admin info no longer required)
    const body = await request.json()
    const { verificationNotes } = body

    // Use "Fleet Admin" as default identifier when using fleet key
    const verifier = 'Fleet Admin'

    // Find guest profile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        email: true,
        insuranceProvider: true,
        policyNumber: true,
        expiryDate: true,
        hasRideshare: true,
        coverageType: true,
        customCoverage: true,
        insuranceCardFrontUrl: true,
        insuranceCardBackUrl: true,
        insuranceNotes: true,
        insuranceVerified: true,
        insuranceVerifiedAt: true,
        insuranceVerifiedBy: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Check if insurance exists
    if (!guest.insuranceProvider || !guest.policyNumber) {
      return NextResponse.json({
        error: 'Cannot verify - guest has not uploaded insurance',
        details: {
          insuranceUploaded: false
        }
      }, { status: 400 })
    }

    // Check if insurance card images exist
    if (!guest.insuranceCardFrontUrl || !guest.insuranceCardBackUrl) {
      return NextResponse.json({
        error: 'Cannot verify - insurance card images not uploaded',
        details: {
          cardFrontUploaded: !!guest.insuranceCardFrontUrl,
          cardBackUploaded: !!guest.insuranceCardBackUrl
        }
      }, { status: 400 })
    }

    // Check if already verified
    if (guest.insuranceVerified) {
      return NextResponse.json({
        error: 'Insurance already verified',
        verifiedAt: guest.insuranceVerifiedAt,
        verifiedBy: guest.insuranceVerifiedBy
      }, { status: 400 })
    }

    // Check if insurance is expired
    if (guest.expiryDate && new Date(guest.expiryDate) < new Date()) {
      return NextResponse.json({
        error: 'Cannot verify - insurance is expired',
        expiryDate: guest.expiryDate
      }, { status: 400 })
    }

    const now = new Date()

    // Get IP for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'admin'
    const userAgent = request.headers.get('user-agent') || 'admin-panel'

    // Update guest profile - set verified
    await prisma.reviewerProfile.update({
      where: { id: guestId },
      data: {
        insuranceVerified: true,
        insuranceVerifiedAt: now,
        insuranceVerifiedBy: verifier
      }
    })

    // Create VERIFIED history entry
    await prisma.insuranceHistory.create({
      data: {
        reviewerProfile: {
          connect: { id: guestId }
        },
        action: 'VERIFIED',
        status: 'ACTIVE',
        insuranceProvider: guest.insuranceProvider,
        policyNumber: guest.policyNumber,
        expiryDate: guest.expiryDate,
        hasRideshare: guest.hasRideshare,
        coverageType: guest.coverageType,
        customCoverage: guest.customCoverage,
        insuranceCardFrontUrl: guest.insuranceCardFrontUrl,
        insuranceCardBackUrl: guest.insuranceCardBackUrl,
        insuranceNotes: guest.insuranceNotes,
        verificationStatus: 'VERIFIED',
        verifiedBy: verifier,
        verifiedAt: now,
        changedBy: verifier,
        changedAt: now,
        changeReason: verificationNotes || 'Insurance verified by admin',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // TODO: Send email notification to guest
    // Subject: "Your Insurance Has Been Verified ✅"
    // Body: Include provider, policy #, coverage type, deposit reduction benefit

    console.log(`✅ Insurance verified for guest ${guest.name} (${guest.email}) by ${verifier}`)

    return NextResponse.json({
      success: true,
      message: 'Insurance verified successfully',
      insurance: {
        provider: guest.insuranceProvider,
        policyNumber: guest.policyNumber,
        expiryDate: guest.expiryDate,
        hasRideshare: guest.hasRideshare,
        coverageType: guest.coverageType,
        verified: true,
        verifiedAt: now,
        verifiedBy: verifier
      }
    })

  } catch (error) {
    console.error('❌ Error verifying insurance:', error)
    return NextResponse.json(
      { error: 'Failed to verify insurance' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: Check insurance verification status
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet authentication
    const searchParams = request.nextUrl.searchParams
    const urlKey = searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const fleetKey = urlKey || headerKey

    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid fleet key' },
        { status: 401 }
      )
    }

    const { id: guestId } = await params

    // Find guest with insurance info
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        email: true,
        insuranceProvider: true,
        policyNumber: true,
        expiryDate: true,
        hasRideshare: true,
        coverageType: true,
        customCoverage: true,
        insuranceCardFrontUrl: true,
        insuranceCardBackUrl: true,
        insuranceNotes: true,
        insuranceVerified: true,
        insuranceVerifiedAt: true,
        insuranceVerifiedBy: true,
        insuranceAddedAt: true,
        insuranceUpdatedAt: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Check if insurance is uploaded
    const insuranceUploaded = !!(guest.insuranceProvider && guest.policyNumber)
    const cardFrontUploaded = !!guest.insuranceCardFrontUrl
    const cardBackUploaded = !!guest.insuranceCardBackUrl
    const allDocsUploaded = cardFrontUploaded && cardBackUploaded

    // Determine status
    let status = 'NOT_UPLOADED'
    let canVerify = false

    if (insuranceUploaded) {
      if (guest.expiryDate && new Date(guest.expiryDate) < new Date()) {
        status = 'EXPIRED'
      } else if (guest.insuranceVerified) {
        status = 'VERIFIED'
      } else if (allDocsUploaded) {
        status = 'PENDING'
        canVerify = true
      } else {
        status = 'INCOMPLETE'
      }
    }

    // Calculate days until expiry
    let daysUntilExpiry = null
    if (guest.expiryDate && status !== 'EXPIRED') {
      const today = new Date()
      const expiry = new Date(guest.expiryDate)
      daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email
      },
      insurance: {
        provider: guest.insuranceProvider,
        policyNumber: guest.policyNumber,
        expiryDate: guest.expiryDate,
        hasRideshare: guest.hasRideshare,
        coverageType: guest.coverageType,
        customCoverage: guest.customCoverage,
        cardFrontUrl: guest.insuranceCardFrontUrl,
        cardBackUrl: guest.insuranceCardBackUrl,
        notes: guest.insuranceNotes,
        verified: guest.insuranceVerified,
        verifiedAt: guest.insuranceVerifiedAt,
        verifiedBy: guest.insuranceVerifiedBy,
        addedAt: guest.insuranceAddedAt,
        updatedAt: guest.insuranceUpdatedAt
      },
      status: {
        current: status,
        insuranceUploaded,
        cardFrontUploaded,
        cardBackUploaded,
        allDocsUploaded,
        canVerify,
        daysUntilExpiry
      }
    })

  } catch (error) {
    console.error('❌ Error fetching insurance status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance status' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE: Reject/Remove insurance verification (admin can unverify)
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet authentication
    const searchParams = request.nextUrl.searchParams
    const urlKey = searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const fleetKey = urlKey || headerKey

    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid fleet key' },
        { status: 401 }
      )
    }

    const { id: guestId } = await params

    // Get reason from request (admin info no longer required)
    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Use "Fleet Admin" as default identifier
    const verifier = 'Fleet Admin'

    // Find guest profile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        name: true,
        email: true,
        insuranceProvider: true,
        policyNumber: true,
        expiryDate: true,
        hasRideshare: true,
        coverageType: true,
        customCoverage: true,
        insuranceCardFrontUrl: true,
        insuranceCardBackUrl: true,
        insuranceNotes: true,
        insuranceVerified: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    if (!guest.insuranceProvider) {
      return NextResponse.json(
        { error: 'No insurance to reject' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Get IP for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'admin'
    const userAgent = request.headers.get('user-agent') || 'admin-panel'

    // Unverify insurance
    await prisma.reviewerProfile.update({
      where: { id: guestId },
      data: {
        insuranceVerified: false,
        insuranceVerifiedAt: null,
        insuranceVerifiedBy: null
      }
    })

    // Create history entry for rejection
    await prisma.insuranceHistory.create({
      data: {
        reviewerProfile: {
          connect: { id: guestId }
        },
        action: 'UPDATED',
        status: 'PENDING',
        insuranceProvider: guest.insuranceProvider,
        policyNumber: guest.policyNumber,
        expiryDate: guest.expiryDate,
        hasRideshare: guest.hasRideshare,
        coverageType: guest.coverageType,
        customCoverage: guest.customCoverage,
        insuranceCardFrontUrl: guest.insuranceCardFrontUrl,
        insuranceCardBackUrl: guest.insuranceCardBackUrl,
        insuranceNotes: guest.insuranceNotes,
        verificationStatus: 'UNVERIFIED',
        changedBy: verifier,
        changedAt: now,
        changeReason: `Verification rejected by admin: ${reason}`,
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    })

    // TODO: Send email to guest explaining rejection reason

    console.log(`⚠️ Insurance verification rejected for guest ${guest.name} (${guest.email}) by ${verifier}`)

    return NextResponse.json({
      success: true,
      message: 'Insurance verification rejected',
      reason
    })

  } catch (error) {
    console.error('❌ Error rejecting insurance:', error)
    return NextResponse.json(
      { error: 'Failed to reject insurance' },
      { status: 500 }
    )
  }
}