// app/api/fleet/partners/[id]/suspend/route.ts
// POST /api/fleet/partners/[id]/suspend - Suspend a partner

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { getPartnerSuspendedTemplate } from '@/app/lib/email/templates/partner-suspended'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason, suspendedBy } = body

    // Find the partner
    const partner = await prisma.rentalHost.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    if (!partner.active) {
      return NextResponse.json(
        { error: 'Partner is already suspended' },
        { status: 400 }
      )
    }

    // Suspend partner
    await prisma.rentalHost.update({
      where: { id },
      data: {
        active: false,
        approvalStatus: 'SUSPENDED'
      }
    })

    // Deactivate all vehicles
    await prisma.rentalCar.updateMany({
      where: { hostId: id },
      data: { isActive: false }
    })

    // Log the suspension
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'PARTNER',
        entityId: id,
        action: 'PARTNER_SUSPENDED',
        metadata: {
          partnerId: id,
          companyName: partner.partnerCompanyName,
          reason: reason,
          suspendedBy: suspendedBy || 'Fleet Admin'
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    // Send suspension email to partner
    try {
      const emailTemplate = getPartnerSuspendedTemplate({
        companyName: partner.partnerCompanyName || partner.name || 'Partner',
        contactName: partner.name || 'Partner',
        contactEmail: partner.email,
        suspensionReason: reason,
        supportEmail: 'info@itwhip.com'
      })

      await sendEmail(
        partner.email,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text,
        { requestId: `suspend-${id}` }
      )

      console.log(`[Partner Suspend] Suspension email sent to: ${partner.email}`)

      // Send admin notification (industry standard: notify operations team)
      const adminEmail = process.env.FLEET_ADMIN_EMAIL || 'info@itwhip.com'
      const adminNotification = {
        subject: `[Fleet Alert] Partner Suspended: ${partner.partnerCompanyName || partner.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Partner Suspension Alert</h2>
            </div>
            <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb;">
              <p><strong>Partner:</strong> ${partner.partnerCompanyName || partner.name}</p>
              <p><strong>Contact:</strong> ${partner.name} (${partner.email})</p>
              <p><strong>Suspended By:</strong> ${suspendedBy || 'Fleet Admin'}</p>
              <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">This is an automated notification from the ItWhip Fleet Management System.</p>
            </div>
          </div>
        `,
        text: `Partner Suspension Alert\n\nPartner: ${partner.partnerCompanyName || partner.name}\nContact: ${partner.name} (${partner.email})\nSuspended By: ${suspendedBy || 'Fleet Admin'}\nReason: ${reason || 'No reason provided'}\nTime: ${new Date().toISOString()}`
      }

      await sendEmail(
        adminEmail,
        adminNotification.subject,
        adminNotification.html,
        adminNotification.text,
        { requestId: `suspend-admin-${id}` }
      )
      console.log(`[Partner Suspend] Admin notification sent to: ${adminEmail}`)
    } catch (emailError) {
      console.error('[Partner Suspend] Failed to send suspension email:', emailError)
      // Don't fail the request if email fails
    }

    console.log(`[Partner Suspend] Partner suspended:`, {
      partnerId: id,
      companyName: partner.partnerCompanyName,
      reason
    })

    return NextResponse.json({
      success: true,
      message: 'Partner suspended successfully'
    })

  } catch (error: any) {
    console.error('[Partner Suspend] Error:', error)
    return NextResponse.json(
      { error: 'Failed to suspend partner' },
      { status: 500 }
    )
  }
}
