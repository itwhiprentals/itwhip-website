// app/api/guest/claims/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

// GET /api/guest/claims/[id] - Get single claim details for guest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { id: claimId } = await params
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

    // Fetch claim with full details
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
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
                licensePlate: true,
                photos: {
                  take: 1,
                  orderBy: { isHero: 'desc' }
                }
              }
            },
            renter: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            },
            reviewerProfile: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePhotoUrl: true
              }
            },
            inspectionPhotos: {
              orderBy: { uploadedAt: 'asc' }
            }
          }
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePhoto: true,
            rating: true
          }
        },
        policy: {
          select: {
            id: true,
            tier: true,
            deductible: true,
            liabilityCoverage: true,
            collisionCoverage: true
          }
        },
        damagePhotos: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Verify guest has access to this claim
    const isFiledByGuest = claim.filedByGuestId === profile.id
    const isBookingGuest =
      claim.booking.renterId === userId ||
      claim.booking.reviewerProfileId === profile.id ||
      claim.booking.guestEmail?.toLowerCase() === userEmail?.toLowerCase()

    if (!isFiledByGuest && !isBookingGuest) {
      return NextResponse.json(
        { error: 'You do not have access to this claim' },
        { status: 403 }
      )
    }

    // Calculate time remaining for response
    const hasDeadline = claim.guestResponseDeadline && !claim.guestResponseText
    const hoursRemaining = hasDeadline
      ? Math.max(0, Math.floor((new Date(claim.guestResponseDeadline!).getTime() - Date.now()) / (1000 * 60 * 60)))
      : null
    const minutesRemaining = hasDeadline
      ? Math.max(0, Math.floor((new Date(claim.guestResponseDeadline!).getTime() - Date.now()) / (1000 * 60)))
      : null
    const deadlineExpired = hasDeadline && minutesRemaining !== null && minutesRemaining <= 0

    // Parse inspection photos
    let preTripPhotos: string[] = []
    let postTripPhotos: string[] = []

    try {
      if (claim.booking.inspectionPhotosStart) {
        preTripPhotos = JSON.parse(claim.booking.inspectionPhotosStart)
      }
    } catch (e) {
      console.error('Error parsing inspectionPhotosStart:', e)
    }

    try {
      if (claim.booking.inspectionPhotosEnd) {
        postTripPhotos = JSON.parse(claim.booking.inspectionPhotosEnd)
      }
    } catch (e) {
      console.error('Error parsing inspectionPhotosEnd:', e)
    }

    // Format response
    const formattedClaim = {
      id: claim.id,
      type: claim.type,
      status: claim.status,
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      approvedAmount: claim.approvedAmount,
      deductible: claim.deductible,
      incidentDate: claim.incidentDate?.toISOString() || null,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      resolvedAt: claim.resolvedAt?.toISOString() || null,
      reviewNotes: claim.reviewNotes,
      reviewedAt: claim.reviewedAt?.toISOString() || null,

      // Claim direction
      isFiledByGuest,
      filedByRole: claim.filedByRole || 'HOST',
      reportedBy: claim.reportedBy,

      // Response status
      hasResponded: !!claim.guestResponseText,
      guestResponseText: claim.guestResponseText,
      guestResponseDate: claim.guestResponseDate?.toISOString() || null,
      guestResponsePhotos: claim.guestResponsePhotos || [],
      responseDeadline: claim.guestResponseDeadline?.toISOString() || null,
      hoursRemaining,
      minutesRemaining,
      deadlineExpired,
      needsResponse: !isFiledByGuest && !claim.guestResponseText && hasDeadline && !deadlineExpired,
      isUrgent: hoursRemaining !== null && hoursRemaining <= 24 && !deadlineExpired,
      accountHoldApplied: claim.accountHoldApplied,

      // Fault determination
      guestAtFault: claim.guestAtFault,
      faultPercentage: claim.faultPercentage,

      // Incident details
      incidentAddress: claim.incidentAddress,
      incidentCity: claim.incidentCity,
      incidentState: claim.incidentState,
      incidentZip: claim.incidentZip,
      incidentDescription: claim.incidentDescription,
      weatherConditions: claim.weatherConditions,
      roadConditions: claim.roadConditions,
      wasPoliceContacted: claim.wasPoliceContacted,
      policeReportNumber: claim.policeReportNumber,

      // Booking info
      booking: {
        id: claim.booking.id,
        bookingCode: claim.booking.bookingCode,
        startDate: claim.booking.startDate.toISOString(),
        endDate: claim.booking.endDate.toISOString(),
        startTime: claim.booking.startTime,
        endTime: claim.booking.endTime,
        totalAmount: claim.booking.totalAmount,
        status: claim.booking.status,
        car: claim.booking.car ? {
          id: claim.booking.car.id,
          displayName: `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`,
          fullDisplayName: `${claim.booking.car.color} ${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`,
          color: claim.booking.car.color,
          licensePlate: claim.booking.car.licensePlate,
          heroPhoto: claim.booking.car.photos?.[0]?.url || null
        } : null
      },

      // Host info
      host: {
        id: claim.host.id,
        name: claim.host.name,
        profilePhoto: claim.host.profilePhoto,
        rating: claim.host.rating,
        phone: claim.host.phone
      },

      // Insurance policy
      policy: claim.policy ? {
        tier: claim.policy.tier,
        deductible: claim.policy.deductible,
        liabilityCoverage: claim.policy.liabilityCoverage,
        collisionCoverage: claim.policy.collisionCoverage
      } : null,

      // Photos
      hostDamagePhotos: claim.damagePhotos
        .filter(p => p.uploadedBy === 'HOST')
        .map(p => ({
          id: p.id,
          url: p.url,
          caption: p.caption
        })),
      guestDamagePhotos: claim.damagePhotos
        .filter(p => p.uploadedBy === 'GUEST')
        .map(p => ({
          id: p.id,
          url: p.url,
          caption: p.caption
        })),

      // Trip documentation photos
      tripPhotos: {
        preTrip: preTripPhotos,
        postTrip: postTripPhotos
      },

      // Messages
      messages: claim.messages.map(m => ({
        id: m.id,
        message: m.message,
        senderType: m.senderType,
        senderName: m.senderName,
        createdAt: m.createdAt.toISOString(),
        attachments: m.attachments
      })),

      // Timeline
      timeline: buildTimeline(claim, isFiledByGuest)
    }

    return NextResponse.json({
      success: true,
      claim: formattedClaim
    })

  } catch (error) {
    console.error('Error fetching guest claim details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim details' },
      { status: 500 }
    )
  }
}

// Build timeline for claim
function buildTimeline(claim: any, isFiledByGuest: boolean) {
  const events = []

  // Claim filed
  events.push({
    type: 'filed',
    title: isFiledByGuest ? 'You filed this claim' : 'Claim filed against you',
    description: `${claim.type.toLowerCase().replace('_', ' ')} claim submitted`,
    date: claim.createdAt.toISOString(),
    by: claim.reportedBy
  })

  // Response deadline set
  if (claim.guestResponseDeadline && !isFiledByGuest) {
    events.push({
      type: 'deadline_set',
      title: 'Response deadline set',
      description: `You have until ${new Date(claim.guestResponseDeadline).toLocaleString()} to respond`,
      date: claim.createdAt.toISOString()
    })
  }

  // Guest responded
  if (claim.guestResponseDate) {
    events.push({
      type: 'responded',
      title: 'Response submitted',
      description: 'Your response was submitted for review',
      date: claim.guestResponseDate.toISOString()
    })
  }

  // Status changes
  if (claim.reviewedAt) {
    events.push({
      type: 'reviewed',
      title: `Claim ${claim.status.toLowerCase()}`,
      description: claim.reviewNotes || `Claim has been ${claim.status.toLowerCase()}`,
      date: claim.reviewedAt.toISOString()
    })
  }

  // Payment
  if (claim.paidToHost) {
    events.push({
      type: 'paid',
      title: 'Payment processed',
      description: `$${claim.paidAmount?.toFixed(2) || '0.00'} paid to host`,
      date: claim.paidToHost.toISOString()
    })
  }

  // Resolved
  if (claim.resolvedAt) {
    events.push({
      type: 'resolved',
      title: 'Claim resolved',
      description: 'This claim has been finalized',
      date: claim.resolvedAt.toISOString()
    })
  }

  return events.sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
