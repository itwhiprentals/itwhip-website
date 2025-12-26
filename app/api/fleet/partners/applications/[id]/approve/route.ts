// app/api/fleet/partners/applications/[id]/approve/route.ts
// POST /api/fleet/partners/applications/[id]/approve - Approve a partner application

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'
import { getHostApprovalTemplate } from '@/app/lib/email/templates/host-approval'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { notes, reviewedBy, commissionRate } = body

    // Find the application
    const application = await prisma.partnerApplication.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Application already approved' },
        { status: 400 }
      )
    }

    // Determine commission rate based on fleet size
    let rate = commissionRate || 0.25 // Default 25%
    if (application.fleetSize >= 100) {
      rate = 0.10 // 10% for 100+ vehicles
    } else if (application.fleetSize >= 50) {
      rate = 0.15 // 15% for 50+ vehicles
    } else if (application.fleetSize >= 10) {
      rate = 0.20 // 20% for 10+ vehicles
    }

    // Update application status
    await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || 'Fleet Admin',
        reviewNotes: notes
      }
    })

    // Update host record
    await prisma.rentalHost.update({
      where: { id: application.hostId },
      data: {
        hostType: 'FLEET_PARTNER',
        approvalStatus: 'APPROVED',
        active: true,
        currentCommissionRate: rate,
        autoApproveListings: true
      }
    })

    // Log commission rate
    await prisma.partnerCommissionHistory.create({
      data: {
        hostId: application.hostId,
        oldRate: 0.25,
        newRate: rate,
        reason: `Initial approval - Fleet size: ${application.fleetSize} vehicles`,
        changedBy: reviewedBy || 'SYSTEM'
      }
    })

    // Send approval email to partner
    try {
      const emailTemplate = getHostApprovalTemplate({
        hostName: application.contactName,
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/partner/dashboard`,
        commissionRate: Math.round(rate * 100),
        permissions: {
          canListCars: true,
          canSetPricing: true,
          canMessageGuests: true,
          canWithdrawFunds: false, // After first completed trip
          instantBookEnabled: false // After 5 successful trips
        },
        nextSteps: [
          'Complete your partner profile and upload your company logo',
          'Connect your bank account for payouts via Stripe',
          'Add your first vehicles to start accepting bookings',
          'Set up your custom landing page at /rideshare/' + (application.host.partnerSlug || 'your-company'),
          'Review our host guidelines and best practices'
        ],
        hostId: application.hostId,
        supportEmail: 'partners@itwhip.com'
      })

      await sendEmail({
        to: application.contactEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      })

      console.log(`[Partner Approval] Approval email sent to ${application.contactEmail}`)
    } catch (emailError) {
      console.error('[Partner Approval] Failed to send approval email:', emailError)
      // Don't fail the approval if email fails
    }

    console.log(`[Partner Approval] Application approved:`, {
      applicationId: id,
      companyName: application.companyName,
      hostId: application.hostId,
      commissionRate: rate
    })

    return NextResponse.json({
      success: true,
      message: 'Application approved successfully',
      partner: {
        id: application.hostId,
        companyName: application.companyName,
        email: application.contactEmail,
        commissionRate: rate
      }
    })

  } catch (error: any) {
    console.error('[Partner Approval] Error:', error)
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    )
  }
}
