// app/api/trip-issues/[bookingId]/route.ts
// API endpoints for managing TripIssue records

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

// ============================================================================
// GET - Fetch TripIssue details for a booking
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

    // Verify user access
    const auth = await verifyRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the trip issue with booking details
    const tripIssue = await prisma.tripIssue.findUnique({
      where: { bookingId },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            tripStatus: true,
            guestEmail: true,
            guestName: true,
            startMileage: true,
            endMileage: true,
            fuelLevelStart: true,
            fuelLevelEnd: true,
            damageReported: true,
            damageDescription: true,
            damagePhotos: true,
            tripStartedAt: true,
            tripEndedAt: true,
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                licensePlate: true
              }
            },
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        claim: {
          select: {
            id: true,
            status: true,
            type: true,
            estimatedCost: true,
            createdAt: true
          }
        }
      }
    })

    if (!tripIssue) {
      return NextResponse.json({
        error: 'No trip issue found for this booking',
        exists: false
      }, { status: 404 })
    }

    // Verify user has access to this issue (guest or host)
    const userEmail = auth.email
    const isGuest = tripIssue.booking.guestEmail === userEmail
    const isHost = tripIssue.booking.host.email === userEmail
    const isAdmin = auth.role === 'ADMIN'

    if (!isGuest && !isHost && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate time remaining until escalation
    let hoursUntilEscalation = null
    if (tripIssue.escalationDeadline && tripIssue.status === 'OPEN') {
      const now = new Date()
      const deadline = new Date(tripIssue.escalationDeadline)
      hoursUntilEscalation = Math.max(0, Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
    }

    return NextResponse.json({
      tripIssue: {
        ...tripIssue,
        hoursUntilEscalation,
        userRole: isAdmin ? 'ADMIN' : isHost ? 'HOST' : 'GUEST',
        canAcknowledge: isGuest && tripIssue.hostReportedAt && !tripIssue.guestAcknowledgedAt,
        canReview: isHost && tripIssue.guestAcknowledgedAt && !tripIssue.hostReviewedAt,
        canResolve: (isHost || isAdmin) && tripIssue.status !== 'RESOLVED' && tripIssue.status !== 'ESCALATED_TO_CLAIM',
        canEscalate: (isHost || isAdmin) && tripIssue.status !== 'ESCALATED_TO_CLAIM'
      }
    })
  } catch (error) {
    console.error('[TripIssue GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch trip issue' }, { status: 500 })
  }
}

// ============================================================================
// PATCH - Update TripIssue (acknowledge, dispute, review, resolve)
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const body = await request.json()
    const { action, notes } = body

    // Verify user access
    const auth = await verifyRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the trip issue
    const tripIssue = await prisma.tripIssue.findUnique({
      where: { bookingId },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            guestEmail: true,
            guestName: true,
            host: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!tripIssue) {
      return NextResponse.json({ error: 'Trip issue not found' }, { status: 404 })
    }

    // Determine user role
    const userEmail = auth.email
    const isGuest = tripIssue.booking.guestEmail === userEmail
    const isHost = tripIssue.booking.host.email === userEmail
    const isAdmin = auth.role === 'ADMIN'

    // Process action based on type
    let updateData: Record<string, unknown> = {}
    let newStatus = tripIssue.status

    switch (action) {
      case 'acknowledge':
        // Guest acknowledges host's report
        if (!isGuest) {
          return NextResponse.json({ error: 'Only guest can acknowledge' }, { status: 403 })
        }
        if (tripIssue.guestAcknowledgedAt) {
          return NextResponse.json({ error: 'Already acknowledged' }, { status: 400 })
        }
        updateData = {
          guestAcknowledgedAt: new Date(),
          guestAckNotes: notes || null,
          status: 'PENDING_HOST_REVIEW'
        }
        newStatus = 'PENDING_HOST_REVIEW'
        break

      case 'dispute':
        // Guest disputes the issue
        if (!isGuest) {
          return NextResponse.json({ error: 'Only guest can dispute' }, { status: 403 })
        }
        updateData = {
          guestAcknowledgedAt: new Date(),
          guestAckNotes: notes || 'Guest disputes this issue',
          status: 'DISPUTED'
        }
        newStatus = 'DISPUTED'
        break

      case 'review':
        // Host reviews after guest acknowledgment
        if (!isHost && !isAdmin) {
          return NextResponse.json({ error: 'Only host or admin can review' }, { status: 403 })
        }
        updateData = {
          hostReviewedAt: new Date(),
          hostReviewNotes: notes || null
        }
        break

      case 'resolve':
        // Resolve the issue without escalating to claim
        if (!isHost && !isAdmin) {
          return NextResponse.json({ error: 'Only host or admin can resolve' }, { status: 403 })
        }
        if (tripIssue.status === 'ESCALATED_TO_CLAIM') {
          return NextResponse.json({ error: 'Cannot resolve - already escalated to claim' }, { status: 400 })
        }
        updateData = {
          resolvedAt: new Date(),
          resolvedBy: isAdmin ? 'ADMIN' : 'HOST',
          resolution: notes || 'Resolved without claim',
          status: 'RESOLVED'
        }
        newStatus = 'RESOLVED'
        break

      case 'add_host_report':
        // Host adds their report to an existing issue
        if (!isHost && !isAdmin) {
          return NextResponse.json({ error: 'Only host or admin can add host report' }, { status: 403 })
        }
        const { description, photos, estimatedCost } = body
        updateData = {
          hostReportedAt: new Date(),
          hostDescription: description,
          hostPhotos: photos || null,
          hostEstimatedCost: estimatedCost || null,
          status: tripIssue.status === 'OPEN' ? 'PENDING_GUEST_ACK' : tripIssue.status,
          hostNotifiedAt: new Date()
        }
        if (tripIssue.status === 'OPEN') {
          newStatus = 'PENDING_GUEST_ACK'
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update the trip issue
    const updatedIssue = await prisma.tripIssue.update({
      where: { bookingId },
      data: updateData
    })

    console.log(`[TripIssue] Updated issue for booking ${tripIssue.booking.bookingCode}: ${action} -> ${newStatus}`)

    return NextResponse.json({
      success: true,
      tripIssue: updatedIssue,
      message: `Trip issue ${action}ed successfully`
    })
  } catch (error) {
    console.error('[TripIssue PATCH] Error:', error)
    return NextResponse.json({ error: 'Failed to update trip issue' }, { status: 500 })
  }
}

// ============================================================================
// POST - Create a new TripIssue (host-initiated) or escalate existing
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params
    const body = await request.json()
    const { action } = body

    // Verify user access
    const auth = await verifyRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the booking
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        tripIssue: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const userEmail = auth.email
    const isHost = booking.host.email === userEmail
    const isAdmin = auth.role === 'ADMIN'

    // Handle escalation to claim
    if (action === 'escalate') {
      if (!booking.tripIssue) {
        return NextResponse.json({ error: 'No trip issue to escalate' }, { status: 404 })
      }
      if (booking.tripIssue.status === 'ESCALATED_TO_CLAIM') {
        return NextResponse.json({ error: 'Already escalated' }, { status: 400 })
      }
      if (!isHost && !isAdmin) {
        return NextResponse.json({ error: 'Only host or admin can escalate' }, { status: 403 })
      }

      // This would link to the claims creation - for now just update status
      // The actual claim creation should happen through the claims API
      const updatedIssue = await prisma.tripIssue.update({
        where: { bookingId },
        data: {
          status: 'ESCALATED_TO_CLAIM',
          autoEscalated: false
        }
      })

      return NextResponse.json({
        success: true,
        tripIssue: updatedIssue,
        message: 'Trip issue escalated. Please file a formal claim.',
        nextAction: `/host/claims/new?bookingId=${bookingId}&fromTripIssue=true`
      })
    }

    // Handle creating a new host-initiated trip issue
    if (action === 'create') {
      if (!isHost && !isAdmin) {
        return NextResponse.json({ error: 'Only host or admin can create trip issue' }, { status: 403 })
      }

      if (booking.tripIssue) {
        return NextResponse.json({
          error: 'Trip issue already exists for this booking',
          tripIssueId: booking.tripIssue.id
        }, { status: 400 })
      }

      const { issueType, severity, description, photos, estimatedCost } = body

      if (!issueType || !severity || !description) {
        return NextResponse.json({
          error: 'Missing required fields: issueType, severity, description'
        }, { status: 400 })
      }

      const escalationDeadline = new Date()
      escalationDeadline.setHours(escalationDeadline.getHours() + 48)

      const tripIssue = await prisma.tripIssue.create({
        data: {
          bookingId,

          // Host report
          hostReportedAt: new Date(),
          hostDescription: description,
          hostPhotos: photos || null,
          hostEstimatedCost: estimatedCost || null,

          // Combined analysis
          issueType,
          severity,

          // Trip capture evidence
          tripStartMileage: booking.startMileage,
          tripEndMileage: booking.endMileage,
          tripStartFuel: booking.fuelLevelStart,
          tripEndFuel: booking.fuelLevelEnd,

          // Status - needs guest acknowledgment
          status: 'PENDING_GUEST_ACK',
          escalationDeadline,
          hostNotifiedAt: new Date()
        }
      })

      console.log(`[TripIssue] Host created issue for booking ${booking.bookingCode}: ${issueType} - ${severity}`)

      // Create admin notification
      await prisma.adminNotification.create({
        data: {
          type: 'TRIP_ISSUE_CREATED',
          title: `Host Reported Issue - ${booking.bookingCode}`,
          message: `Host ${booking.host.name} reported ${severity.toLowerCase()} ${issueType.toLowerCase()} issue. ${description}`,
          priority: severity === 'MAJOR' ? 'HIGH' : severity === 'MODERATE' ? 'MEDIUM' : 'LOW',
          status: 'UNREAD',
          relatedId: bookingId,
          relatedType: 'TripIssue',
          actionRequired: true,
          actionUrl: `/admin/rentals/verifications/${bookingId}`,
          metadata: {
            issueType,
            severity,
            description,
            escalationDeadline: escalationDeadline.toISOString(),
            hasPhotos: !!photos,
            estimatedCost
          }
        }
      })

      return NextResponse.json({
        success: true,
        tripIssue,
        message: 'Trip issue created. Guest will be notified.',
        escalationDeadline: escalationDeadline.toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[TripIssue POST] Error:', error)
    return NextResponse.json({ error: 'Failed to process trip issue' }, { status: 500 })
  }
}
