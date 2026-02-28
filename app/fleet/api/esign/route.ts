// app/fleet/api/esign/route.ts
// Fleet API for E-Sign and Agreement Management

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateApiKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(todayStart)
    monthStart.setMonth(monthStart.getMonth() - 1)

    // Partner Onboarding Agreement Stats (from HostProspect - recruited hosts)
    const [
      totalPartnerAgreements,
      validatedAgreements,
      avgValidationScore,
      pendingValidation,
      recentPartnerAgreements,
      preferenceBreakdown,
    ] = await Promise.all([
      // Total prospects with uploaded agreements
      prisma.hostProspect.count({
        where: { hostAgreementUrl: { not: null } }
      }),
      // Agreements that passed validation (score >= 40)
      prisma.hostProspect.count({
        where: {
          agreementValidationScore: { gte: 40 }
        }
      }),
      // Average validation score
      prisma.hostProspect.aggregate({
        where: { agreementValidationScore: { not: null } },
        _avg: { agreementValidationScore: true }
      }),
      // Agreements pending validation (uploaded but no score)
      prisma.hostProspect.count({
        where: {
          hostAgreementUrl: { not: null },
          agreementValidationScore: null
        }
      }),
      // Recent partner agreement uploads
      prisma.hostProspect.findMany({
        where: { hostAgreementUrl: { not: null } },
        select: {
          id: true,
          name: true,
          email: true,
          hostAgreementUrl: true,
          hostAgreementName: true,
          agreementValidationScore: true,
          agreementValidationSummary: true,
          agreementPreference: true,
          itwhipAgreementAccepted: true,
          testAgreementSignedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      }),
      // Agreement preference breakdown
      prisma.hostProspect.groupBy({
        by: ['agreementPreference'],
        _count: true
      })
    ])

    // Booking Agreement Stats (from RentalBooking)
    const [
      totalBookingAgreements,
      signedAgreements,
      pendingSignatures,
      expiredAgreements,
      agreementsByStatus,
      recentBookingAgreements,
    ] = await Promise.all([
      // Total bookings with agreements sent
      prisma.rentalBooking.count({
        where: { agreementStatus: { not: 'not_sent' } }
      }),
      // Signed agreements
      prisma.rentalBooking.count({
        where: { agreementStatus: 'signed' }
      }),
      // Pending signatures
      prisma.rentalBooking.count({
        where: { agreementStatus: { in: ['sent', 'viewed'] } }
      }),
      // Expired agreements
      prisma.rentalBooking.count({
        where: {
          agreementExpiresAt: { lt: now },
          agreementStatus: { not: 'signed' }
        }
      }),
      // Agreements by status
      prisma.rentalBooking.groupBy({
        by: ['agreementStatus'],
        _count: true
      }),
      // Recent booking agreements
      prisma.rentalBooking.findMany({
        where: { agreementStatus: { not: 'not_sent' } },
        select: {
          id: true,
          agreementStatus: true,
          agreementSentAt: true,
          agreementViewedAt: true,
          agreementSignedAt: true,
          agreementExpiresAt: true,
          agreementSignedPdfUrl: true,
          agreementType: true,
          hostAgreementUrl: true,
          renter: {
            select: { name: true, email: true }
          },
          car: {
            select: {
              make: true,
              model: true,
              year: true,
              host: { select: { businessName: true } }
            }
          }
        },
        orderBy: { agreementSentAt: 'desc' },
        take: 20
      })
    ])

    // Calculate metrics
    const signatureRate = totalBookingAgreements > 0
      ? (signedAgreements / totalBookingAgreements * 100).toFixed(1)
      : '0'

    const validationPassRate = totalPartnerAgreements > 0
      ? (validatedAgreements / totalPartnerAgreements * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      success: true,
      partnerAgreements: {
        total: totalPartnerAgreements,
        validated: validatedAgreements,
        pending: pendingValidation,
        avgScore: avgValidationScore._avg.agreementValidationScore?.toFixed(0) || 0,
        passRate: validationPassRate,
        recent: recentPartnerAgreements,
        byPreference: preferenceBreakdown
      },
      bookingAgreements: {
        total: totalBookingAgreements,
        signed: signedAgreements,
        pending: pendingSignatures,
        expired: expiredAgreements,
        signatureRate,
        byStatus: agreementsByStatus,
        recent: recentBookingAgreements
      },
      updatedAt: now.toISOString()
    })
  } catch (error) {
    console.error('[fleet/api/esign] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch e-sign data'
    }, { status: 500 })
  }
}
