// app/api/guest/claims/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/send-email'
import { getClaimNotificationFleetTemplate } from '@/app/lib/email/templates/claim-notification-fleet'
import { trackActivity } from '@/lib/helpers/guestProfileStatus'
import { nanoid } from 'nanoid'

// GET /api/guest/claims - List all claims for logged-in guest
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email

    // Find guest's ReviewerProfile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // 'all', 'filed_by_me', 'against_me'
    const status = searchParams.get('status') || 'all'
    const getEligibleBookings = searchParams.get('getEligibleBookings') === 'true'

    // ========== ELIGIBLE BOOKINGS FOR NEW CLAIM ==========
    // If requested, return bookings where guest can file a claim
    if (getEligibleBookings) {
      // Get all bookings for this guest
      const bookings = await prisma.rentalBooking.findMany({
        where: {
          OR: [
            { renterId: userId },
            { reviewerProfileId: profile.id },
            { guestEmail: userEmail || '' }
          ],
          // Only completed or active trips can have claims filed
          status: { in: ['COMPLETED', 'ACTIVE', 'CONFIRMED'] }
        },
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              color: true,
              photos: {
                take: 1,
                orderBy: { isHero: 'desc' }
              }
            }
          },
          host: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          // Check for existing claims on this booking
          Claim: {
            select: {
              id: true,
              status: true,
              type: true,
              filedByRole: true,
              filedByGuestId: true,
              guestResponseText: true,
              guestResponseDeadline: true
            }
          },
          // Check for TripIssue that needs acknowledgment
          TripIssue: {
            select: {
              id: true,
              status: true,
              issueType: true,
              severity: true,
              hostReportedAt: true,
              hostDescription: true,
              guestAcknowledgedAt: true,
              escalationDeadline: true
            }
          }
        },
        orderBy: { endDate: 'desc' }
      })

      // Process bookings to determine eligibility
      const eligibleBookings = bookings.map(booking => {
        // Find claims on this booking
        const claimsAgainstGuest = booking.Claim.filter((c: any) =>
          c.filedByRole === null || c.filedByRole === 'HOST' || c.filedByRole === 'FLEET'
        )
        const claimsFiledByGuest = booking.Claim.filter((c: any) =>
          c.filedByGuestId === profile.id || c.filedByRole === 'GUEST'
        )

        // Check if there's an active claim against guest that needs response
        const pendingClaimAgainstGuest = claimsAgainstGuest.find((c: any) =>
          !['APPROVED', 'DENIED', 'CLOSED', 'RESOLVED'].includes(c.status) &&
          !c.guestResponseText
        )

        // Check if guest already filed a claim for this booking
        const hasGuestFiledClaim = claimsFiledByGuest.some((c: any) =>
          !['DENIED', 'CLOSED'].includes(c.status) // Active or pending claim by guest
        )

        // Check for unacknowledged TripIssue from host
        const tripIssue = booking.TripIssue
        const hasUnacknowledgedTripIssue = tripIssue &&
          tripIssue.hostReportedAt &&
          !tripIssue.guestAcknowledgedAt &&
          tripIssue.status !== 'RESOLVED' &&
          tripIssue.status !== 'ESCALATED_TO_CLAIM'

        // Calculate hours until escalation for trip issue
        let tripIssueHoursRemaining = null
        if (hasUnacknowledgedTripIssue && tripIssue?.escalationDeadline) {
          const now = new Date()
          const deadline = new Date(tripIssue.escalationDeadline)
          tripIssueHoursRemaining = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
        }

        // Determine eligibility
        let canFileClaim = true
        let blockReason: string | null = null

        if (hasUnacknowledgedTripIssue) {
          canFileClaim = false
          blockReason = `Host reported a ${tripIssue!.issueType.toLowerCase()} issue. Please acknowledge or dispute it before filing a claim.`
        } else if (pendingClaimAgainstGuest) {
          canFileClaim = false
          blockReason = 'You must respond to the existing claim against you before filing a new claim.'
        } else if (hasGuestFiledClaim) {
          canFileClaim = false
          blockReason = 'You have already filed a claim for this booking.'
        }

        return {
          id: booking.id,
          bookingCode: booking.bookingCode,
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          status: booking.status,
          car: booking.car ? {
            id: booking.car.id,
            displayName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
            color: booking.car.color,
            heroPhoto: booking.car.photos?.[0]?.url || null
          } : null,
          host: {
            id: booking.host.id,
            name: booking.host.name,
            profilePhoto: booking.host.profilePhoto
          },
          // Claim eligibility info
          canFileClaim,
          blockReason,
          existingClaims: {
            againstGuest: claimsAgainstGuest.length,
            filedByGuest: claimsFiledByGuest.length,
            pendingResponse: !!pendingClaimAgainstGuest
          },
          // TripIssue info
          tripIssue: tripIssue ? {
            id: tripIssue.id,
            status: tripIssue.status,
            issueType: tripIssue.issueType,
            severity: tripIssue.severity,
            hostReported: !!tripIssue.hostReportedAt,
            guestAcknowledged: !!tripIssue.guestAcknowledgedAt,
            needsAcknowledgment: hasUnacknowledgedTripIssue || false,
            hoursUntilEscalation: tripIssueHoursRemaining
          } : null
        }
      })

      // Also return current claims for display at top
      const currentClaims = await prisma.claim.findMany({
        where: {
          OR: [
            {
              AND: [
                {
                  booking: {
                    OR: [
                      { renterId: userId },
                      { reviewerProfileId: profile.id },
                      { guestEmail: userEmail || '' }
                    ]
                  }
                },
                {
                  OR: [
                    { filedByRole: null },
                    { filedByRole: 'HOST' },
                    { filedByRole: 'FLEET' },
                    { filedByRole: 'PARTNER' }
                  ]
                }
              ]
            },
            { filedByGuestId: profile.id }
          ],
          // Only show active claims
          status: { notIn: ['DENIED', 'CLOSED', 'RESOLVED'] }
        },
        include: {
          booking: {
            select: {
              bookingCode: true,
              car: {
                select: {
                  make: true,
                  model: true,
                  year: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      return NextResponse.json({
        success: true,
        eligibleBookings,
        currentClaims: currentClaims.map(c => ({
          id: c.id,
          type: c.type,
          status: c.status,
          isFiledByGuest: c.filedByGuestId === profile.id,
          needsResponse: !c.guestResponseText && c.guestResponseDeadline && new Date(c.guestResponseDeadline) > new Date(),
          bookingCode: c.booking?.bookingCode,
          carDetails: c.booking?.car ? `${c.booking.car.year} ${c.booking.car.make} ${c.booking.car.model}` : null,
          createdAt: c.createdAt.toISOString()
        }))
      })
    }

    // Build where clause for claims
    // Claims "against me" = claims filed by hosts for bookings where I was the guest
    //   (filedByRole is not 'GUEST', OR filedByRole is null for legacy claims)
    // Claims "filed by me" = claims I filed (filedByGuestId matches my profile id)
    const whereClause: any = {
      OR: [
        // Claims against this guest (bookings where they were the renter)
        // Legacy claims (filedByRole is null) are treated as filed by host
        {
          AND: [
            {
              booking: {
                OR: [
                  { renterId: userId },
                  { reviewerProfileId: profile.id },
                  { guestEmail: userEmail || '' }
                ]
              }
            },
            {
              OR: [
                { filedByRole: null }, // Legacy claims filed before guest claims feature
                { filedByRole: 'HOST' },
                { filedByRole: 'FLEET' },
                { filedByRole: 'PARTNER' }
              ]
            }
          ]
        },
        // Claims filed BY this guest
        {
          filedByGuestId: profile.id
        }
      ]
    }

    // Apply filter
    if (filter === 'filed_by_me') {
      whereClause.OR = [{ filedByGuestId: profile.id }]
    } else if (filter === 'against_me') {
      whereClause.OR = [{
        AND: [
          {
            booking: {
              OR: [
                { renterId: userId },
                { reviewerProfileId: profile.id },
                { guestEmail: userEmail || '' }
              ]
            }
          },
          {
            OR: [
              { filedByRole: null },
              { filedByRole: 'HOST' },
              { filedByRole: 'FLEET' },
              { filedByRole: 'PARTNER' }
            ]
          }
        ]
      }]
    }

    // Apply status filter
    if (status !== 'all') {
      if (status === 'pending_response') {
        whereClause.guestResponseText = null
        whereClause.guestResponseDeadline = { gte: new Date() }
        whereClause.status = { in: ['PENDING', 'UNDER_REVIEW'] }
      } else if (status === 'under_review') {
        whereClause.status = 'UNDER_REVIEW'
      } else if (status === 'resolved') {
        whereClause.status = { in: ['APPROVED', 'DENIED', 'PAID', 'RESOLVED'] }
      } else {
        whereClause.status = status.toUpperCase()
      }
    }

    // Fetch claims
    const claims = await prisma.claim.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                color: true,
                photos: {
                  take: 1,
                  orderBy: { isHero: 'desc' }
                }
              }
            },
            renter: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            rating: true
          }
        },
        InsurancePolicy: {
          select: {
            tier: true,
            deductible: true
          }
        },
        ClaimDamagePhoto: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform claims for frontend
    const formattedClaims = claims.map(claim => {
      const isFiledByGuest = claim.filedByGuestId === profile.id
      const hasDeadline = claim.guestResponseDeadline && !claim.guestResponseText
      const hoursRemaining = hasDeadline
        ? Math.max(0, Math.floor((new Date(claim.guestResponseDeadline!).getTime() - Date.now()) / (1000 * 60 * 60)))
        : null

      return {
        id: claim.id,
        type: claim.type,
        status: claim.status,
        description: claim.description,
        estimatedCost: claim.estimatedCost,
        approvedAmount: claim.approvedAmount,
        deductible: claim.deductible,
        incidentDate: claim.incidentDate?.toISOString() || null,
        createdAt: claim.createdAt.toISOString(),

        // Claim type
        isFiledByGuest,
        filedByRole: claim.filedByRole || 'HOST',

        // Response status
        hasResponded: !!claim.guestResponseText,
        guestResponseDate: claim.guestResponseDate?.toISOString() || null,
        responseDeadline: claim.guestResponseDeadline?.toISOString() || null,
        hoursRemaining,
        needsResponse: !isFiledByGuest && !claim.guestResponseText && hasDeadline && hoursRemaining !== null && hoursRemaining > 0,
        isUrgent: hoursRemaining !== null && hoursRemaining <= 24,

        // Booking info
        booking: {
          id: claim.booking.id,
          bookingCode: claim.booking.bookingCode,
          startDate: claim.booking.startDate.toISOString(),
          endDate: claim.booking.endDate.toISOString(),
          car: claim.booking.car ? {
            id: claim.booking.car.id,
            displayName: `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`,
            color: claim.booking.car.color,
            heroPhoto: claim.booking.car.photos?.[0]?.url || null
          } : null
        },

        // Host info (for claims against guest)
        host: {
          id: claim.host.id,
          name: claim.host.name,
          profilePhoto: claim.host.profilePhoto,
          rating: claim.host.rating
        },

        // Photos
        damagePhotos: claim.ClaimDamagePhoto.map((p: any) => ({
          id: p.id,
          url: p.url,
          caption: p.caption,
          uploadedBy: p.uploadedBy
        }))
      }
    })

    // Calculate summary
    const summary = {
      total: formattedClaims.length,
      filedByMe: formattedClaims.filter(c => c.isFiledByGuest).length,
      againstMe: formattedClaims.filter(c => !c.isFiledByGuest).length,
      needingResponse: formattedClaims.filter(c => c.needsResponse).length,
      underReview: formattedClaims.filter(c => c.status === 'UNDER_REVIEW').length,
      resolved: formattedClaims.filter(c => ['APPROVED', 'DENIED', 'PAID', 'RESOLVED'].includes(c.status)).length
    }

    return NextResponse.json({
      success: true,
      claims: formattedClaims,
      summary,
      filter,
      status
    })

  } catch (error) {
    console.error('Error fetching guest claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}

// POST /api/guest/claims - Guest files a new claim against host
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email

    // Find guest's ReviewerProfile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    // Check if guest account is on hold or suspended
    const guestStatus = await prisma.guestProfileStatus.findUnique({
      where: { guestId: profile.id }
    })

    if (guestStatus?.accountStatus === 'SUSPENDED' || guestStatus?.accountStatus === 'BANNED') {
      return NextResponse.json(
        {
          error: 'Your account is suspended. Please resolve existing claims before filing new ones.',
          accountStatus: guestStatus.accountStatus
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      bookingId,
      claimType,
      description,
      incidentDate,
      photos = []
    } = body

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    if (!claimType || !['VEHICLE_ISSUE', 'OVERCHARGE', 'SAFETY_CONCERN', 'HOST_MISCONDUCT', 'PROPERTY_DAMAGE', 'OTHER'].includes(claimType)) {
      return NextResponse.json(
        { error: 'Valid claim type is required' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 50) {
      return NextResponse.json(
        { error: 'Description must be at least 50 characters' },
        { status: 400 }
      )
    }

    if (!incidentDate) {
      return NextResponse.json(
        { error: 'Incident date is required' },
        { status: 400 }
      )
    }

    // Verify the booking exists and belongs to this guest
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        InsurancePolicy: {
          select: {
            id: true,
            tier: true,
            deductible: true
          }
        },
        // Include TripIssue to check for unacknowledged issues
        TripIssue: {
          select: {
            id: true,
            status: true,
            issueType: true,
            hostReportedAt: true,
            guestAcknowledgedAt: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify guest owns this booking
    const isGuestBooking =
      booking.renterId === userId ||
      booking.reviewerProfileId === profile.id ||
      booking.guestEmail?.toLowerCase() === userEmail?.toLowerCase()

    if (!isGuestBooking) {
      return NextResponse.json(
        { error: 'You do not have access to this booking' },
        { status: 403 }
      )
    }

    // ========== TRIP ISSUE GUARD ==========
    // Check if there's an unacknowledged TripIssue from host
    if (booking.TripIssue) {
      const tripIssue = booking.TripIssue
      const hasUnacknowledgedTripIssue =
        tripIssue.hostReportedAt &&
        !tripIssue.guestAcknowledgedAt &&
        tripIssue.status !== 'RESOLVED' &&
        tripIssue.status !== 'ESCALATED_TO_CLAIM'

      if (hasUnacknowledgedTripIssue) {
        return NextResponse.json(
          {
            error: `You must acknowledge or dispute the ${tripIssue.issueType.toLowerCase()} issue reported by the host before filing a claim.`,
            tripIssueId: tripIssue.id,
            tripIssueStatus: tripIssue.status,
            actionRequired: 'acknowledge_trip_issue'
          },
          { status: 400 }
        )
      }
    }
    // ========== END TRIP ISSUE GUARD ==========

    // Check if a claim already exists for this booking from this guest
    const existingClaim = await prisma.claim.findFirst({
      where: {
        bookingId,
        filedByGuestId: profile.id
      }
    })

    if (existingClaim) {
      return NextResponse.json(
        {
          error: 'You have already filed a claim for this booking',
          existingClaimId: existingClaim.id
        },
        { status: 400 }
      )
    }

    // Check if booking has an insurance policy
    if (!booking.InsurancePolicy) {
      return NextResponse.json(
        { error: 'This booking does not have an insurance policy' },
        { status: 400 }
      )
    }

    // Create the claim
    const claim = await prisma.claim.create({
      data: {
        id: nanoid(),
        bookingId,
        hostId: booking.hostId,
        policyId: booking.InsurancePolicy.id,
        type: claimType,
        description: description.trim(),
        incidentDate: new Date(incidentDate),
        estimatedCost: 0, // Guest doesn't set cost
        status: 'PENDING',
        reportedBy: profile.name || 'Guest',
        filedByGuestId: profile.id,
        filedByRole: 'GUEST',
        guestAtFault: false, // Default - not guest's fault if they're filing
        deductible: booking.InsurancePolicy.deductible,
        updatedAt: new Date()
      }
    })

    // Add photos if provided
    if (photos.length > 0) {
      await prisma.claimDamagePhoto.createMany({
        data: photos.map((url: string, index: number) => ({
          claimId: claim.id,
          url,
          order: index,
          uploadedBy: 'GUEST'
        }))
      })
    }

    // Create notification for host
    await prisma.hostNotification.create({
      data: {
        id: nanoid(),
        hostId: booking.hostId,
        type: 'GUEST_CLAIM_FILED',
        category: 'claim',
        subject: 'Guest Filed a Claim',
        message: `A guest has filed a ${claimType.toLowerCase().replace('_', ' ')} claim for booking ${booking.bookingCode}. Please review the claim.`,
        status: 'PENDING',
        priority: 'HIGH',
        actionUrl: `/host/claims/${claim.id}`,
        actionLabel: 'View Claim',
        updatedAt: new Date()
      }
    })

    // Send email notification to Fleet
    try {
      const carDetails = booking.car
        ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
        : 'Vehicle'

      const { subject, html, text } = getClaimNotificationFleetTemplate({
        claimId: claim.id,
        bookingCode: booking.bookingCode,
        hostName: booking.host.name,
        guestName: profile.name,
        carDetails,
        incidentDate: claim.incidentDate.toISOString(),
        estimatedCost: 0,
        claimType,
        reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/fleet/claims/${claim.id}`,
        priority: 'medium',
        insuranceProvider: 'Platform Insurance',
        earningsTier: 'N/A'
      })

      await sendEmail({
        to: process.env.FLEET_EMAIL || 'fleet@itwhip.com',
        subject: `[GUEST CLAIM] ${subject}`,
        html,
        text
      })
    } catch (emailError) {
      console.error('Failed to send guest claim notification email:', emailError)
      // Don't fail the claim creation if email fails
    }

    // Track activity for guest profile status
    try {
      await trackActivity(profile.id, {
        action: 'CLAIM_FILED' as any,
        description: `Filed a ${claimType.toLowerCase().replace('_', ' ')} claim for booking ${booking.bookingCode}`,
        metadata: {
          claimId: claim.id,
          bookingId,
          claimType,
          filedBy: 'GUEST'
        }
      })
    } catch (activityError) {
      console.error('Failed to track claim activity:', activityError)
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: nanoid(),
        userId: userId || profile.id,
        action: 'guest_claim_filed',
        entityType: 'claim',
        entityId: claim.id,
        metadata: {
          claimId: claim.id,
          bookingId,
          bookingCode: booking.bookingCode,
          claimType,
          hostId: booking.hostId,
          hostNotified: true
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Claim submitted successfully. The host and our team will review it.',
      claim: {
        id: claim.id,
        type: claim.type,
        status: claim.status,
        createdAt: claim.createdAt.toISOString(),
        booking: {
          bookingCode: booking.bookingCode,
          car: booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : null
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error filing guest claim:', error)
    return NextResponse.json(
      { error: 'Failed to file claim' },
      { status: 500 }
    )
  }
}
