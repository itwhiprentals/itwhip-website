// app/api/fleet/partners/[id]/reactivate/route.ts
// POST /api/fleet/partners/[id]/reactivate - Reactivate a suspended partner

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { getPartnerReactivatedTemplate } from '@/app/lib/email/templates/partner-reactivated'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the partner
    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      include: {
        partnerDocuments: {
          where: { isExpired: true }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    if (partner.active) {
      return NextResponse.json(
        { error: 'Partner is already active' },
        { status: 400 }
      )
    }

    // Check for expired documents
    if (partner.partnerDocuments.length > 0) {
      const expiredTypes = partner.partnerDocuments.map(d => d.type).join(', ')
      return NextResponse.json(
        {
          error: `Cannot reactivate: Partner has expired documents (${expiredTypes}). Documents must be updated first.`,
          expiredDocuments: partner.partnerDocuments.map(d => ({
            id: d.id,
            type: d.type,
            expiresAt: d.expiresAt
          }))
        },
        { status: 400 }
      )
    }

    // Reactivate partner
    await prisma.rentalHost.update({
      where: { id },
      data: {
        active: true,
        approvalStatus: 'APPROVED'
      }
    })

    // Reactivate vehicles (they will need individual review)
    // For now, we keep them inactive and require manual reactivation
    // await prisma.rentalCar.updateMany({
    //   where: { hostId: id },
    //   data: { active: true }
    // })

    // Log the reactivation
    await prisma.activityLog.create({
      data: {
        entityType: 'PARTNER',
        entityId: id,
        action: 'PARTNER_REACTIVATED',
        metadata: {
          partnerId: id,
          companyName: partner.partnerCompanyName
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    // Send reactivation email to partner
    try {
      const emailTemplate = getPartnerReactivatedTemplate({
        companyName: partner.partnerCompanyName || partner.displayName || 'Partner',
        contactName: partner.name || 'Partner',
        contactEmail: partner.email,
        dashboardUrl: 'https://itwhip.com/partner/dashboard',
        supportEmail: 'info@itwhip.com'
      })

      await sendEmail(
        partner.email,
        emailTemplate.subject,
        emailTemplate.html,
        emailTemplate.text,
        { requestId: `reactivate-${id}` }
      )

      console.log(`[Partner Reactivate] Reactivation email sent to: ${partner.email}`)

      // Send admin notification (industry standard: notify operations team)
      const adminEmail = process.env.FLEET_ADMIN_EMAIL || 'info@itwhip.com'
      const adminNotification = {
        subject: `[Fleet Alert] Partner Reactivated: ${partner.partnerCompanyName || partner.displayName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Partner Reactivation Alert</h2>
            </div>
            <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb;">
              <p><strong>Partner:</strong> ${partner.partnerCompanyName || partner.displayName}</p>
              <p><strong>Contact:</strong> ${partner.name} (${partner.email})</p>
              <p><strong>Status:</strong> Active</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p style="color: #d97706; margin-top: 16px;"><strong>Note:</strong> Vehicle listings require manual reactivation.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">This is an automated notification from the ItWhip Fleet Management System.</p>
            </div>
          </div>
        `,
        text: `Partner Reactivation Alert\n\nPartner: ${partner.partnerCompanyName || partner.displayName}\nContact: ${partner.name} (${partner.email})\nStatus: Active\nTime: ${new Date().toISOString()}\n\nNote: Vehicle listings require manual reactivation.`
      }

      await sendEmail(
        adminEmail,
        adminNotification.subject,
        adminNotification.html,
        adminNotification.text,
        { requestId: `reactivate-admin-${id}` }
      )
      console.log(`[Partner Reactivate] Admin notification sent to: ${adminEmail}`)
    } catch (emailError) {
      console.error('[Partner Reactivate] Failed to send reactivation email:', emailError)
      // Don't fail the request if email fails
    }

    console.log(`[Partner Reactivate] Partner reactivated:`, {
      partnerId: id,
      companyName: partner.partnerCompanyName
    })

    return NextResponse.json({
      success: true,
      message: 'Partner reactivated successfully. Vehicle listings require manual reactivation.'
    })

  } catch (error: any) {
    console.error('[Partner Reactivate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate partner' },
      { status: 500 }
    )
  }
}
