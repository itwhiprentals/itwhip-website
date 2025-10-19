// app/api/fleet/guests/[id]/insurance/route.ts
// ✅ FLEET API - Fetch guest insurance for admin view

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet authentication
    const urlKey = req.nextUrl.searchParams.get('key')
    const headerKey = req.headers.get('x-fleet-key')
    const fleetKey = urlKey || headerKey

    console.log('[FLEET API] GET /api/fleet/guests/[id]/insurance', {
      hasUrlKey: !!urlKey,
      hasHeaderKey: !!headerKey,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date().toISOString()
    })

    if (fleetKey !== 'phoenix-fleet-2847') {
      console.log('[FLEET API] ❌ UNAUTHORIZED - Invalid or missing key')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[FLEET API] ✅ ALLOWED with phoenix key')

    const resolvedParams = await params
    const guestId = resolvedParams.id

    // Find the ReviewerProfile by id (not userId)
    const profile = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        userId: true,
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

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate status and days until expiry
    let status = 'NOT_ACTIVE'
    let daysUntilExpiry = null

    if (profile.insuranceProvider && profile.policyNumber) {
      if (profile.expiryDate) {
        const expiryDate = new Date(profile.expiryDate)
        const today = new Date()
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          status = 'EXPIRED'
        } else {
          daysUntilExpiry = diffDays
          status = profile.insuranceVerified ? 'ACTIVE' : 'PENDING'
        }
      } else {
        status = profile.insuranceVerified ? 'ACTIVE' : 'PENDING'
      }
    }

    const currentInsurance = {
      provider: profile.insuranceProvider,
      policyNumber: profile.policyNumber,
      expiryDate: profile.expiryDate?.toISOString() || null,
      hasRideshare: profile.hasRideshare || false,
      coverageType: profile.coverageType,
      customCoverage: profile.customCoverage,
      cardFrontUrl: profile.insuranceCardFrontUrl,
      cardBackUrl: profile.insuranceCardBackUrl,
      notes: profile.insuranceNotes,
      verified: profile.insuranceVerified || false,
      verifiedAt: profile.insuranceVerifiedAt?.toISOString() || null,
      verifiedBy: profile.insuranceVerifiedBy,
      addedAt: profile.insuranceAddedAt?.toISOString() || null,
      updatedAt: profile.insuranceUpdatedAt?.toISOString() || null,
      status,
      daysUntilExpiry
    }

    return NextResponse.json({
      current: currentInsurance
    })

  } catch (error) {
    console.error('[FLEET API] Error fetching insurance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance data' },
      { status: 500 }
    )
  }
}