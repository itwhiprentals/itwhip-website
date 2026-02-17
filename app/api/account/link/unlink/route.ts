// app/api/account/link/unlink/route.ts
// POST /api/account/link/unlink - Unlink two accounts (host only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
  // Verify the user is logged in
  const user = await verifyRequest(request)
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Check if user has a linked account
  if (!user.legacyDualId) {
    return NextResponse.json(
      { error: 'Your account is not linked to another account' },
      { status: 400 }
    )
  }

  // Find the linked user
  const linkedUser = await prisma.user.findFirst({
    where: {
      legacyDualId: user.legacyDualId,
      id: { not: user.id }
    },
    select: { id: true, email: true, name: true }
  })

  if (!linkedUser) {
    return NextResponse.json(
      { error: 'Linked account not found' },
      { status: 404 }
    )
  }

  const legacyDualId = user.legacyDualId

  try {
    // Unlink both accounts in a transaction
    await prisma.$transaction(async (tx) => {
      // Clear legacyDualId from current user
      await tx.user.update({
        where: { id: user.id },
        data: { legacyDualId: null }
      })

      // Clear legacyDualId from linked user
      await tx.user.update({
        where: { id: linkedUser.id },
        data: { legacyDualId: null }
      })

      // Clear legacyDualId from current user's profiles
      await tx.rentalHost.updateMany({
        where: { userId: user.id },
        data: { legacyDualId: null }
      })

      await tx.reviewerProfile.updateMany({
        where: { userId: user.id },
        data: { legacyDualId: null }
      })

      // Clear legacyDualId from linked user's profiles
      await tx.rentalHost.updateMany({
        where: { userId: linkedUser.id },
        data: { legacyDualId: null }
      })

      await tx.reviewerProfile.updateMany({
        where: { userId: linkedUser.id },
        data: { legacyDualId: null }
      })

      // Mark any completed link requests as unlinked (optional - for audit trail)
      await tx.accountLinkRequest.updateMany({
        where: { legacyDualId: legacyDualId },
        data: { status: 'EXPIRED' } // Reuse EXPIRED status to indicate unlinked
      })
    })

    console.log(`[Account Unlink] ✅ Successfully unlinked accounts:`)
    console.log(`   User 1: ${user.id} (${user.email})`)
    console.log(`   User 2: ${linkedUser.id} (${linkedUser.email})`)
    console.log(`   Previous Legacy Dual ID: ${legacyDualId}`)

    // Send notification emails to both users
    const userEmail = user.email || 'User'
    const linkedEmail = linkedUser.email || 'Linked User'

    // Send to current user
    try {
      const htmlContent = generateUnlinkEmail(userEmail, linkedEmail)
      const textContent = `
Your accounts have been unlinked.

Your account (${userEmail}) has been unlinked from (${linkedEmail}).

If you didn't request this, please contact support immediately.

- ItWhip Team
      `.trim()

      await sendEmail(
        userEmail,
        'ItWhip - Your Accounts Have Been Unlinked',
        htmlContent,
        textContent
      )
      console.log(`[Account Unlink] Notification sent to: ${userEmail}`)
    } catch (emailError) {
      console.error('[Account Unlink] Failed to send email to current user:', emailError)
    }

    // Send to linked user
    try {
      const htmlContent = generateUnlinkEmail(linkedEmail, userEmail)
      const textContent = `
Your accounts have been unlinked.

Your account (${linkedEmail}) has been unlinked from (${userEmail}).

If you didn't request this, please contact support immediately.

- ItWhip Team
      `.trim()

      await sendEmail(
        linkedEmail,
        'ItWhip - Your Accounts Have Been Unlinked',
        htmlContent,
        textContent
      )
      console.log(`[Account Unlink] Notification sent to: ${linkedEmail}`)
    } catch (emailError) {
      console.error('[Account Unlink] Failed to send email to linked user:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Accounts have been successfully unlinked'
    })
  } catch (error) {
    console.error('[Account Unlink] ❌ Transaction failed:', error)
    return NextResponse.json(
      { error: 'Failed to unlink accounts. Please try again.' },
      { status: 500 }
    )
  }
}

// Generate unlink notification email
function generateUnlinkEmail(userEmail: string, linkedEmail: string): string {
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
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Account Update</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; width: 64px; height: 64px; background-color: #f3f4f6; border-radius: 50%; line-height: 64px;">
                        <span style="font-size: 32px;">🔓</span>
                      </div>
                    </div>

                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Accounts Unlinked</h2>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                      Your accounts have been successfully unlinked.
                    </p>

                    <!-- Account Details -->
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 12px; color: #374151; font-size: 14px;">
                        <strong>Your account:</strong> ${userEmail}
                      </p>
                      <p style="margin: 0; color: #374151; font-size: 14px;">
                        <strong>Unlinked from:</strong> ${linkedEmail}
                      </p>
                    </div>

                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 14px; line-height: 20px; text-align: center;">
                      You will no longer be able to switch between these accounts. If you want to link them again, you can do so from your host account settings.
                    </p>

                    <!-- Warning -->
                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        If you didn't request this unlink, please contact support immediately.
                      </p>
                    </div>

                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
                      Need help? Contact us at
                      <a href="mailto:info@itwhip.com" style="color: #6b7280; text-decoration: none;">info@itwhip.com</a>
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
