// app/api/fleet/partners/applications/[id]/approve/route.ts
// POST /api/fleet/partners/applications/[id]/approve - Approve a partner application

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'
import { getPartnerWelcomeTemplate } from '@/app/lib/email/templates/partner-welcome'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { notes, reviewedBy, commissionRate } = body

    // Find the application
    const application = await prisma.partner_applications.findUnique({
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
    await prisma.partner_applications.update({
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
    await prisma.partner_commission_history.create({
      data: {
        hostId: application.hostId,
        oldRate: 0.25,
        newRate: rate,
        reason: `Initial approval - Fleet size: ${application.fleetSize} vehicles`,
        changedBy: reviewedBy || 'SYSTEM'
      }
    })

    // Generate password reset token for the partner
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update User with hashed reset token (matches pattern in host reset-password API)
    if (application.host?.user) {
      await prisma.user.update({
        where: { id: application.host.user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry,
          resetTokenUsed: false
        }
      })
    }

    // Determine tier based on commission rate
    let tier: 'Standard' | 'Gold' | 'Platinum' | 'Diamond' = 'Standard'
    if (rate <= 0.10) tier = 'Diamond'
    else if (rate <= 0.15) tier = 'Platinum'
    else if (rate <= 0.20) tier = 'Gold'

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'
    const resetPasswordUrl = `${baseUrl}/partner/reset-password?token=${resetToken}`

    // Send welcome email to partner with password reset link
    try {
      const emailTemplate = getPartnerWelcomeTemplate({
        companyName: application.companyName,
        contactName: application.contactName,
        contactEmail: application.contactEmail,
        resetPasswordUrl,
        resetTokenExpiresIn: '24 hours',
        commissionRate: Math.round(rate * 100),
        tier,
        dashboardUrl: `${baseUrl}/partner/dashboard`,
        fleetSize: String(application.fleetSize),
        supportEmail: 'info@itwhip.com'
      })

      await sendEmail(
        application.contactEmail,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text,
        { requestId: `partner-approval-${id}` }
      )

      console.log(`[Partner Approval] Welcome email with password reset sent to ${application.contactEmail}`)
    } catch (emailError) {
      console.error('[Partner Approval] Failed to send welcome email:', emailError)
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
