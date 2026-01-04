// app/api/guest/claims/[id]/respond/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { removeAccountHold } from '@/app/lib/claims/account-hold'
import { sendEmail } from '@/app/lib/email/send-email'
import { getClaimResponseConfirmationTemplate } from '@/app/lib/email/templates/claim-response-confirmation'
import { getClaimGuestResponseReceivedTemplate } from '@/app/lib/email/templates/claim-guest-response-received'

const MIN_RESPONSE_LENGTH = 100

// POST /api/guest/claims/[id]/respond - Submit guest response to claim
export async function POST(
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

    // Parse request body
    const body = await request.json()
    const { response, evidencePhotos = [] } = body

    // Validate response text
    if (!response || typeof response !== 'string') {
      return NextResponse.json(
        { error: 'Response text is required' },
        { status: 400 }
      )
    }

    if (response.trim().length < MIN_RESPONSE_LENGTH) {
      return NextResponse.json(
        { error: `Response must be at least ${MIN_RESPONSE_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate photos array
    if (!Array.isArray(evidencePhotos)) {
      return NextResponse.json(
        { error: 'Evidence photos must be an array' },
        { status: 400 }
      )
    }

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

    // Fetch the claim
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        booking: {
          include: {
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            }
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
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      )
    }

    // Verify this claim is against the guest (not filed by them)
    const isFiledByGuest = claim.filedByGuestId === profile.id
    if (isFiledByGuest) {
      return NextResponse.json(
        { error: 'You cannot respond to a claim you filed' },
        { status: 400 }
      )
    }

    // Verify guest has access to this claim
    const isBookingGuest =
      claim.booking.renterId === userId ||
      claim.booking.reviewerProfileId === profile.id ||
      claim.booking.guestEmail?.toLowerCase() === userEmail?.toLowerCase()

    if (!isBookingGuest) {
      return NextResponse.json(
        { error: 'You do not have access to this claim' },
        { status: 403 }
      )
    }

    // Check if already responded
    if (claim.guestResponseText) {
      return NextResponse.json(
        { error: 'You have already responded to this claim' },
        { status: 400 }
      )
    }

    // Check if deadline has passed
    if (claim.guestResponseDeadline) {
      const now = new Date()
      if (now > claim.guestResponseDeadline) {
        return NextResponse.json(
          {
            error: 'The response deadline has passed. Please contact support for assistance.',
            deadlineExpired: true
          },
          { status: 400 }
        )
      }
    }

    // Update the claim with response
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        guestResponseText: response.trim(),
        guestResponseDate: new Date(),
        guestResponsePhotos: evidencePhotos,
        status: 'UNDER_REVIEW',
        updatedAt: new Date()
      }
    })

    // Add guest's evidence photos to ClaimDamagePhoto if any
    if (evidencePhotos.length > 0) {
      const existingPhotosCount = await prisma.claimDamagePhoto.count({
        where: { claimId }
      })

      await prisma.claimDamagePhoto.createMany({
        data: evidencePhotos.map((url: string, index: number) => ({
          claimId,
          url,
          uploadedBy: 'GUEST',
          order: existingPhotosCount + index + 1
        }))
      })
    }

    // Remove account hold if one was applied for this claim
    try {
      const guestEmail = claim.booking.guestEmail || profile.email || userEmail
      if (guestEmail) {
        await removeAccountHold(guestEmail, claimId)
        console.log(`Account hold removed for ${guestEmail} after responding to claim ${claimId}`)
      }
    } catch (holdError) {
      // Don't fail if hold removal fails
      console.error('Failed to remove account hold:', holdError)
    }

    // Log activity
    try {
      await prisma.claimActivity.create({
        data: {
          claimId,
          action: 'GUEST_RESPONDED',
          performedBy: profile.name || profile.email || 'Guest',
          performedByRole: 'GUEST',
          details: JSON.stringify({
            responseLength: response.trim().length,
            evidencePhotosCount: evidencePhotos.length,
            respondedWithinDeadline: true
          })
        }
      })
    } catch (activityError) {
      // Don't fail if activity logging fails
      console.error('Failed to log claim activity:', activityError)
    }

    // Send notification email to Fleet/Admin
    try {
      const adminEmailData = {
        claimId,
        guestName: profile.name || 'Guest',
        guestEmail: profile.email || userEmail || '',
        hostName: claim.host.name,
        carDetails: claim.booking.car
          ? `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
          : 'Unknown Vehicle',
        bookingCode: claim.booking.bookingCode,
        claimType: claim.type,
        estimatedCost: claim.estimatedCost?.toNumber() || 0,
        responseText: response.trim().substring(0, 500) + (response.length > 500 ? '...' : ''),
        evidencePhotosCount: evidencePhotos.length,
        respondedAt: new Date().toISOString(),
        claimUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/claims/${claimId}`
      }
      const adminTemplate = getClaimGuestResponseReceivedTemplate(adminEmailData)
      await sendEmail({
        to: process.env.FLEET_ADMIN_EMAIL || 'claims@itwhip.com',
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text
      })
    } catch (emailError) {
      // Don't fail if email fails
      console.error('Failed to send response notification email:', emailError)
    }

    // Send confirmation email to guest
    try {
      const guestEmailData = {
        guestName: profile.name || 'Guest',
        claimId,
        claimType: claim.type,
        carDetails: claim.booking.car
          ? `${claim.booking.car.year} ${claim.booking.car.make} ${claim.booking.car.model}`
          : 'Unknown Vehicle',
        bookingCode: claim.booking.bookingCode,
        hostName: claim.host.name,
        responseSubmittedAt: new Date().toISOString(),
        evidencePhotosCount: evidencePhotos.length,
        claimUrl: `${process.env.NEXT_PUBLIC_APP_URL}/claims/${claimId}`
      }
      const guestTemplate = getClaimResponseConfirmationTemplate(guestEmailData)
      await sendEmail({
        to: profile.email || userEmail || '',
        subject: guestTemplate.subject,
        html: guestTemplate.html,
        text: guestTemplate.text
      })
    } catch (emailError) {
      console.error('Failed to send guest confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Your response has been submitted successfully',
      claim: {
        id: updatedClaim.id,
        status: updatedClaim.status,
        guestResponseDate: updatedClaim.guestResponseDate?.toISOString(),
        guestResponsePhotos: updatedClaim.guestResponsePhotos
      }
    })

  } catch (error) {
    console.error('Error submitting claim response:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}
