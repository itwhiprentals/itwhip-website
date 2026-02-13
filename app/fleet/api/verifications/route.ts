// app/fleet/api/verifications/route.ts
// Fleet-level ID verification queue API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const filter = searchParams.get('filter') || 'pending' // pending | reviewed | all
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    // Build where clause
    const where: any = {}

    if (filter === 'pending') {
      // Bookings with docs submitted (any status) that haven't been approved/rejected yet
      where.documentsSubmittedAt = { not: null }
      where.verificationStatus = { notIn: ['APPROVED', 'REJECTED'] }
    } else if (filter === 'needs_review') {
      // AI flagged for manual review (has AI score but not auto-passed)
      where.aiVerificationScore = { gte: 1, lt: 85 }
    } else if (filter === 'ai_passed') {
      // AI auto-passed (score >= 85, no critical flags)
      where.aiVerificationScore = { gte: 85 }
    } else if (filter === 'stripe_verified') {
      // Bookings where guest has Stripe Identity verified
      where.reviewerProfile = {
        stripeIdentityStatus: 'verified',
      }
    } else if (filter === 'reviewed') {
      where.verificationStatus = { in: ['APPROVED', 'REJECTED'] }
    }
    // 'all' = show all bookings with docs or AI verification
    if (filter === 'all') {
      where.OR = [
        { documentsSubmittedAt: { not: null } },
        { aiVerificationAt: { not: null } },
        { reviewerProfile: { stripeIdentityStatus: { not: null } } },
      ]
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { bookingCode: { contains: search, mode: 'insensitive' } },
            { guestName: { contains: search, mode: 'insensitive' } },
            { guestEmail: { contains: search, mode: 'insensitive' } },
          ]
        }
      ]
    }

    const [bookings, total] = await Promise.all([
      prisma.rentalBooking.findMany({
        where,
        select: {
          id: true,
          bookingCode: true,
          status: true,
          verificationStatus: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          startDate: true,
          endDate: true,
          totalAmount: true,
          createdAt: true,
          documentsSubmittedAt: true,
          verificationDeadline: true,
          verificationNotes: true,
          reviewedBy: true,
          reviewedAt: true,
          licenseVerified: true,
          selfieVerified: true,
          licensePhotoUrl: true,
          licenseBackPhotoUrl: true,
          insurancePhotoUrl: true,
          selfiePhotoUrl: true,
          licenseNumber: true,
          licenseState: true,
          licenseExpiry: true,
          dateOfBirth: true,
          // AI verification
          aiVerificationResult: true,
          aiVerificationScore: true,
          aiVerificationAt: true,
          aiVerificationModel: true,
          // Stripe guest profile (full identity data)
          reviewerProfile: {
            select: {
              id: true,
              stripeIdentityStatus: true,
              stripeIdentityVerifiedAt: true,
              stripeIdentityReportId: true,
              stripeVerifiedFirstName: true,
              stripeVerifiedLastName: true,
              stripeVerifiedDob: true,
              stripeVerifiedIdNumber: true,
              stripeVerifiedIdExpiry: true,
              stripeVerifiedAddress: true,
              stripeDocFrontFileId: true,
              stripeDocBackFileId: true,
              stripeSelfieFileId: true,
              documentsVerified: true,
              fullyVerified: true,
              name: true,
              email: true,
              phoneNumber: true,
              dateOfBirth: true,
              driverLicenseNumber: true,
              driverLicenseExpiry: true,
            }
          },
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              photos: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
            }
          },
          host: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        orderBy: [
          { documentsSubmittedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rentalBooking.count({ where }),
    ])

    // Stats
    const [pendingCount, aiPassedCount, reviewedTodayCount, totalWithDocs, stripeVerifiedCount] = await Promise.all([
      // Pending: has docs but not yet approved/rejected
      prisma.rentalBooking.count({
        where: {
          documentsSubmittedAt: { not: null },
          verificationStatus: { notIn: ['APPROVED', 'REJECTED'] },
        }
      }),
      // AI passed: score >= 85
      prisma.rentalBooking.count({
        where: {
          aiVerificationScore: { gte: 85 },
        }
      }),
      // Reviewed today
      prisma.rentalBooking.count({
        where: {
          reviewedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          verificationStatus: { in: ['APPROVED', 'REJECTED'] },
        }
      }),
      // Total with docs or AI verification
      prisma.rentalBooking.count({
        where: {
          OR: [
            { documentsSubmittedAt: { not: null } },
            { aiVerificationAt: { not: null } },
          ]
        }
      }),
      // Stripe verified bookings
      prisma.rentalBooking.count({
        where: {
          reviewerProfile: { stripeIdentityStatus: 'verified' }
        }
      }),
    ])

    const formatted = bookings.map(b => {
      const ai = b.aiVerificationResult as any
      return {
        id: b.id,
        bookingCode: b.bookingCode,
        status: b.status,
        verificationStatus: b.verificationStatus,
        guestName: b.guestName,
        guestEmail: b.guestEmail,
        guestPhone: b.guestPhone,
        startDate: b.startDate,
        endDate: b.endDate,
        totalAmount: b.totalAmount,
        createdAt: b.createdAt,
        documentsSubmittedAt: b.documentsSubmittedAt,
        verificationDeadline: b.verificationDeadline,
        verificationNotes: b.verificationNotes,
        reviewedBy: b.reviewedBy,
        reviewedAt: b.reviewedAt,
        // Documents
        hasLicenseFront: !!b.licensePhotoUrl,
        hasLicenseBack: !!b.licenseBackPhotoUrl,
        hasInsurance: !!b.insurancePhotoUrl,
        hasSelfie: !!b.selfiePhotoUrl,
        licensePhotoUrl: b.licensePhotoUrl,
        licenseBackPhotoUrl: b.licenseBackPhotoUrl,
        insurancePhotoUrl: b.insurancePhotoUrl,
        licenseState: b.licenseState,
        licenseNumber: b.licenseNumber,
        dateOfBirth: b.dateOfBirth,
        // AI
        aiScore: b.aiVerificationScore,
        aiPassed: ai?.quickVerifyPassed ?? null,
        aiAt: b.aiVerificationAt,
        aiModel: b.aiVerificationModel,
        aiCriticalFlags: ai?.validation?.criticalFlags?.length ?? 0,
        aiInfoFlags: ai?.validation?.informationalFlags?.length ?? 0,
        aiRecommendation: ai?.quickVerifyPassed === true
          ? 'APPROVE'
          : (b.aiVerificationScore && b.aiVerificationScore >= 60)
            ? 'REVIEW'
            : ai ? 'REJECT' : null,
        aiExtractedName: ai?.data?.fullName || null,
        aiNameMatch: ai?.validation?.nameMatch ?? null,
        // Stripe Identity (full data)
        stripe: b.reviewerProfile ? {
          status: b.reviewerProfile.stripeIdentityStatus,
          verified: b.reviewerProfile.stripeIdentityStatus === 'verified' || b.reviewerProfile.documentsVerified === true,
          verifiedAt: b.reviewerProfile.stripeIdentityVerifiedAt,
          reportId: b.reviewerProfile.stripeIdentityReportId,
          verifiedFirstName: b.reviewerProfile.stripeVerifiedFirstName,
          verifiedLastName: b.reviewerProfile.stripeVerifiedLastName,
          verifiedDob: b.reviewerProfile.stripeVerifiedDob,
          verifiedIdNumber: b.reviewerProfile.stripeVerifiedIdNumber
            ? `***${b.reviewerProfile.stripeVerifiedIdNumber.slice(-4)}`
            : null,
          verifiedIdExpiry: b.reviewerProfile.stripeVerifiedIdExpiry,
          verifiedAddress: b.reviewerProfile.stripeVerifiedAddress,
          docFrontFileId: b.reviewerProfile.stripeDocFrontFileId,
          docBackFileId: b.reviewerProfile.stripeDocBackFileId,
          selfieFileId: b.reviewerProfile.stripeSelfieFileId,
          profileName: b.reviewerProfile.name,
          profileEmail: b.reviewerProfile.email,
          fullyVerified: b.reviewerProfile.fullyVerified,
        } : null,
        stripeVerified: b.reviewerProfile?.stripeIdentityStatus === 'verified' || b.reviewerProfile?.documentsVerified === true,
        // Car
        car: {
          make: b.car.make,
          model: b.car.model,
          year: b.car.year,
          photoUrl: b.car.photos[0]?.url,
        },
        hostName: b.host?.name || 'Unknown',
      }
    })

    // ── Stripe Identity guest list (all guests with Stripe verification) ──
    // Only fetched when filter=stripe_verified or filter=all, for the Stripe tab
    let stripeGuests: any[] = []
    if (filter === 'stripe_verified' || filter === 'all') {
      const stripeProfileWhere: any = {
        stripeIdentityStatus: { not: null },
      }
      if (search) {
        stripeProfileWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { stripeVerifiedFirstName: { contains: search, mode: 'insensitive' } },
          { stripeVerifiedLastName: { contains: search, mode: 'insensitive' } },
        ]
      }

      const profiles = await prisma.reviewerProfile.findMany({
        where: stripeProfileWhere,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          profilePhotoUrl: true,
          memberSince: true,
          stripeIdentityStatus: true,
          stripeIdentityVerifiedAt: true,
          stripeIdentityReportId: true,
          stripeIdentitySessionId: true,
          stripeVerifiedFirstName: true,
          stripeVerifiedLastName: true,
          stripeVerifiedDob: true,
          stripeVerifiedIdNumber: true,
          stripeVerifiedIdExpiry: true,
          stripeVerifiedAddress: true,
          documentsVerified: true,
          fullyVerified: true,
          dateOfBirth: true,
          driverLicenseNumber: true,
          driverLicenseExpiry: true,
          // Count their bookings
          _count: { select: { RentalBooking: true } },
        },
        orderBy: { stripeIdentityVerifiedAt: 'desc' },
        take: 50,
      })

      stripeGuests = profiles.map(p => ({
        profileId: p.id,
        name: p.name,
        email: p.email,
        phone: p.phoneNumber,
        photoUrl: p.profilePhotoUrl,
        memberSince: p.memberSince,
        bookingCount: p._count.RentalBooking,
        stripe: {
          status: p.stripeIdentityStatus,
          verified: p.stripeIdentityStatus === 'verified',
          verifiedAt: p.stripeIdentityVerifiedAt,
          reportId: p.stripeIdentityReportId,
          sessionId: p.stripeIdentitySessionId,
          verifiedFirstName: p.stripeVerifiedFirstName,
          verifiedLastName: p.stripeVerifiedLastName,
          verifiedDob: p.stripeVerifiedDob,
          verifiedIdNumber: p.stripeVerifiedIdNumber
            ? `***${p.stripeVerifiedIdNumber.slice(-4)}`
            : null,
          verifiedIdExpiry: p.stripeVerifiedIdExpiry,
          verifiedAddress: p.stripeVerifiedAddress,
          documentType: 'driving_license',
          issuingCountry: 'US',
        },
        documentsVerified: p.documentsVerified,
        fullyVerified: p.fullyVerified,
      }))
    }

    // Count all Stripe profiles (not just booking-linked)
    const totalStripeProfiles = await prisma.reviewerProfile.count({
      where: { stripeIdentityStatus: { not: null } },
    })
    const stripeVerifiedProfiles = await prisma.reviewerProfile.count({
      where: { stripeIdentityStatus: 'verified' },
    })

    return NextResponse.json({
      success: true,
      verifications: formatted,
      stripeGuests,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        pending: pendingCount,
        aiPassed: aiPassedCount,
        stripeVerified: stripeVerifiedCount,
        stripeVerifiedProfiles,
        totalStripeProfiles,
        reviewedToday: reviewedTodayCount,
        totalWithDocs: totalWithDocs,
      },
    })
  } catch (error: any) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 })
  }
}
