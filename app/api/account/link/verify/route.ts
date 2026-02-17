// app/api/account/link/verify/route.ts
// POST /api/account/link/verify - Verify code and assign legacyDualId to both accounts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
  const { requestId, verificationCode } = await request.json()

  // Validate input
  if (!requestId || !verificationCode) {
    return NextResponse.json(
      { error: 'Request ID and verification code are required' },
      { status: 400 }
    )
  }

  // Find link request
  const linkRequest = await prisma.accountLinkRequest.findUnique({
    where: { id: requestId }
  })

  if (!linkRequest) {
    return NextResponse.json({ error: 'Link request not found' }, { status: 404 })
  }

  // Check status - accept both PENDING and GUEST_CONFIRMED
  if (linkRequest.status !== 'PENDING' && linkRequest.status !== 'GUEST_CONFIRMED') {
    return NextResponse.json(
      { error: `Link request is ${linkRequest.status.toLowerCase()}` },
      { status: 400 }
    )
  }

  // Check expiration
  if (new Date() > linkRequest.codeExpiresAt) {
    await prisma.accountLinkRequest.update({
      where: { id: requestId },
      data: { status: 'EXPIRED' }
    })
    return NextResponse.json(
      { error: 'Verification code expired' },
      { status: 400 }
    )
  }

  // Verify code (case-insensitive)
  if (linkRequest.verificationCode.toUpperCase() !== verificationCode.toUpperCase()) {
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Find target user
  const targetUser = await prisma.user.findUnique({
    where: { email: linkRequest.targetEmail },
    select: { id: true, email: true, name: true, legacyDualId: true }
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Target user not found' },
      { status: 404 }
    )
  }

  // Double-check that neither user has been linked since request was created
  const initiatingUser = await prisma.user.findUnique({
    where: { id: linkRequest.initiatingUserId },
    select: { id: true, email: true, name: true, legacyDualId: true }
  })

  if (initiatingUser?.legacyDualId) {
    return NextResponse.json(
      { error: 'Initiating account has been linked to another account since this request was created' },
      { status: 400 }
    )
  }

  if (targetUser.legacyDualId) {
    return NextResponse.json(
      { error: 'Target account has been linked to another account since this request was created' },
      { status: 400 }
    )
  }

  // Generate legacyDualId (16 characters)
  const legacyDualId = nanoid(16)

  // Assign to both Users and their profiles in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Update initiating user
      await tx.user.update({
        where: { id: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update target user
      await tx.user.update({
        where: { id: targetUser.id },
        data: { legacyDualId: legacyDualId }
      })

      // Update their profiles (RentalHost and ReviewerProfile)
      // Update all RentalHost profiles for initiating user
      await tx.rentalHost.updateMany({
        where: { userId: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update all ReviewerProfile profiles for initiating user
      await tx.reviewerProfile.updateMany({
        where: { userId: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update all RentalHost profiles for target user
      await tx.rentalHost.updateMany({
        where: { userId: targetUser.id },
        data: { legacyDualId: legacyDualId }
      })

      // Update all ReviewerProfile profiles for target user
      await tx.reviewerProfile.updateMany({
        where: { userId: targetUser.id },
        data: { legacyDualId: legacyDualId }
      })

      // Mark request as completed
      await tx.accountLinkRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          legacyDualId: legacyDualId,
          verifiedAt: new Date()
        }
      })
    })

    console.log(`[Account Link] ✅ Successfully linked accounts:`)
    console.log(`   Initiating User: ${linkRequest.initiatingUserId}`)
    console.log(`   Target User: ${targetUser.id}`)
    console.log(`   Legacy Dual ID: ${legacyDualId}`)

    // Send thank-you email to guest (target user)
    try {
      const targetEmail = targetUser.email || linkRequest.targetEmail
      const hostEmail = initiatingUser?.email || 'Host Account'

      const htmlContent = generateThankYouEmail(targetEmail, hostEmail, 'guest')
      const textContent = `
Your accounts are now linked!

Your guest account (${targetEmail}) has been successfully linked with the host account (${hostEmail}).

You can now switch between roles seamlessly using the role switcher in the header.

- ItWhip Team
      `.trim()

      await sendEmail(
        targetEmail,
        'ItWhip - Your Accounts Are Now Linked!',
        htmlContent,
        textContent
      )
      console.log(`[Account Link] Thank-you email sent to: ${targetEmail}`)
    } catch (emailError) {
      console.error('[Account Link] Failed to send thank-you email:', emailError)
      // Don't fail the request - linking was successful
    }

    return NextResponse.json({
      success: true,
      message: 'Accounts successfully linked!',
      legacyDualId: legacyDualId
    })
  } catch (error) {
    console.error('[Account Link] ❌ Transaction failed:', error)
    return NextResponse.json(
      { error: 'Failed to link accounts. Please try again.' },
      { status: 500 }
    )
  }
}

// Generate thank-you email template
function generateThankYouEmail(userEmail: string, linkedEmail: string, userType: 'guest' | 'host'): string {
  const roleLabel = userType === 'guest' ? 'guest' : 'host'
  const linkedRoleLabel = userType === 'guest' ? 'host' : 'guest'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Accounts Linked Successfully!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; width: 64px; height: 64px; background-color: #d1fae5; border-radius: 50%; line-height: 64px;">
                        <span style="font-size: 32px;">✓</span>
                      </div>
                    </div>

                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Your Accounts Are Linked!</h2>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      Your ${roleLabel} account has been successfully linked with the ${linkedRoleLabel} account.
                    </p>

                    <!-- Account Details -->
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 12px; color: #374151; font-size: 14px;">
                        <strong>Your ${roleLabel} account:</strong> ${userEmail}
                      </p>
                      <p style="margin: 0; color: #374151; font-size: 14px;">
                        <strong>Linked ${linkedRoleLabel} account:</strong> ${linkedEmail}
                      </p>
                    </div>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 20px; text-align: center;">
                      You can now switch between your host and guest roles seamlessly using the role switcher in the header.
                    </p>

                    <div style="text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}${userType === 'host' ? '/host/dashboard' : '/dashboard'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                    </div>

                    <p style="margin: 32px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      Need help? Contact us at
                      <a href="mailto:info@itwhip.com" style="color: #10b981; text-decoration: none;">info@itwhip.com</a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      ItWhip Technologies, Inc.
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2026 ItWhip. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
