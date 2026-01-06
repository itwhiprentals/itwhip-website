// app/api/fleet/partners/applications/[id]/reject/route.ts
// POST /api/fleet/partners/applications/[id]/reject - Reject a partner application

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { notes, reviewedBy, reason } = body

    // Find the application
    const application = await prisma.partnerApplication.findUnique({
      where: { id },
      include: {
        host: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Application already rejected' },
        { status: 400 }
      )
    }

    if (application.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot reject an approved application' },
        { status: 400 }
      )
    }

    // Update application status
    await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: reviewedBy || 'Fleet Admin',
        reviewNotes: notes || reason
      }
    })

    // Update host record
    await prisma.rentalHost.update({
      where: { id: application.hostId },
      data: {
        hostType: 'PENDING',
        approvalStatus: 'REJECTED',
        active: false
      }
    })

    // Send rejection email to partner
    try {
      const rejectionHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                color: #111827;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border: 1px solid #e5e7eb;
              }
              .header {
                background: #f9fafb;
                padding: 30px 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
              }
              .header h1 {
                font-size: 24px;
                font-weight: 600;
                color: #111827;
                margin: 0;
              }
              .content {
                padding: 30px 20px;
              }
              .message-box {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 20px;
                margin: 24px 0;
                border-radius: 6px;
              }
              .footer {
                background: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Application Update</h1>
              </div>

              <div class="content">
                <p style="font-size: 16px; margin-bottom: 16px;">Hello ${application.contactName},</p>

                <p style="color: #4b5563; margin-bottom: 24px;">
                  Thank you for your interest in becoming an ItWhip Fleet Partner. After careful review of your
                  application for <strong>${application.companyName}</strong>, we regret to inform you that we are
                  unable to approve your application at this time.
                </p>

                ${notes ? `
                <div class="message-box">
                  <p style="font-size: 14px; color: #991b1b;">
                    <strong>Feedback:</strong><br>
                    ${notes}
                  </p>
                </div>
                ` : ''}

                <p style="color: #4b5563; margin-bottom: 16px;">
                  This decision does not prevent you from reapplying in the future. If you believe there has been
                  an error or would like to provide additional information, please contact our partner team.
                </p>

                <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
                  Questions?<br>
                  <a href="mailto:partners@itwhip.com" style="color: #f97316;">partners@itwhip.com</a>
                </p>
              </div>

              <div class="footer">
                <strong>ITWHIP FLEET PARTNER PROGRAM</strong><br>
                &copy; 2025 ItWhip Technologies. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `

      const rejectionText = `
Application Update

Hello ${application.contactName},

Thank you for your interest in becoming an ItWhip Fleet Partner. After careful review of your application for ${application.companyName}, we regret to inform you that we are unable to approve your application at this time.

${notes ? `Feedback: ${notes}` : ''}

This decision does not prevent you from reapplying in the future. If you believe there has been an error or would like to provide additional information, please contact our partner team.

Questions? Contact partners@itwhip.com

ITWHIP FLEET PARTNER PROGRAM
© 2025 ItWhip Technologies. All rights reserved.
      `

      await sendEmail({
        to: application.contactEmail,
        subject: `Application Update - ${application.companyName} | ItWhip Fleet Partner Program`,
        html: rejectionHtml,
        text: rejectionText
      })

      console.log(`[Partner Rejection] Rejection email sent to ${application.contactEmail}`)
    } catch (emailError) {
      console.error('[Partner Rejection] Failed to send rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    console.log(`[Partner Rejection] Application rejected:`, {
      applicationId: id,
      companyName: application.companyName,
      hostId: application.hostId,
      reason: notes || reason
    })

    return NextResponse.json({
      success: true,
      message: 'Application rejected',
      application: {
        id: application.id,
        companyName: application.companyName,
        status: 'REJECTED'
      }
    })

  } catch (error: any) {
    console.error('[Partner Rejection] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    )
  }
}
