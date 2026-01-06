// app/api/account/link/confirm-host/route.ts
// POST /api/account/link/confirm-host - Host clicks email link to complete linking

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

export async function POST(request: NextRequest) {
  // Get token from request body
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  // Find link request by host token
  const linkRequest = await prisma.accountLinkRequest.findUnique({
    where: { hostLinkToken: token }
  })

  if (!linkRequest) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  // Check status - must be GUEST_CONFIRMED
  if (linkRequest.status !== 'GUEST_CONFIRMED') {
    if (linkRequest.status === 'COMPLETED') {
      return NextResponse.json({
        error: 'Accounts are already linked',
        alreadyLinked: true
      }, { status: 400 })
    }
    if (linkRequest.status === 'PENDING') {
      return NextResponse.json({
        error: 'Waiting for guest to confirm first',
        waitingForGuest: true
      }, { status: 400 })
    }
    return NextResponse.json({
      error: `This link request is ${linkRequest.status.toLowerCase()}`
    }, { status: 400 })
  }

  // Check expiration
  if (new Date() > linkRequest.codeExpiresAt) {
    await prisma.accountLinkRequest.update({
      where: { id: linkRequest.id },
      data: { status: 'EXPIRED' }
    })
    return NextResponse.json({ error: 'This link has expired. Please request a new link.' }, { status: 400 })
  }

  // Verify the logged-in user is the initiator (host)
  const user = await verifyRequest(request)
  if (!user) {
    return NextResponse.json({
      error: 'Please log in to your host account first',
      requiresAuth: true
    }, { status: 401 })
  }

  // Check if logged-in user is the initiating user
  if (user.id !== linkRequest.initiatingUserId) {
    return NextResponse.json({
      error: 'This link is for a different account. Please log in with the correct host account.',
      wrongAccount: true
    }, { status: 403 })
  }

  // Check if user is already linked
  if (user.legacyDualId) {
    return NextResponse.json({
      error: 'Your account is already linked to another account',
      alreadyLinked: true
    }, { status: 400 })
  }

  // Find target user (guest)
  const targetUser = await prisma.user.findUnique({
    where: { email: linkRequest.targetEmail },
    select: { id: true, email: true, name: true, legacyDualId: true }
  })

  if (!targetUser) {
    return NextResponse.json({ error: 'Guest account not found' }, { status: 404 })
  }

  if (targetUser.legacyDualId) {
    return NextResponse.json({
      error: 'The guest account has already been linked to another account',
      alreadyLinked: true
    }, { status: 400 })
  }

  // Generate legacyDualId (16 characters)
  const legacyDualId = nanoid(16)

  // Assign to both Users and their profiles in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Update initiating user (host)
      await tx.user.update({
        where: { id: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update target user (guest)
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
        where: { id: linkRequest.id },
        data: {
          status: 'COMPLETED',
          legacyDualId: legacyDualId,
          verifiedAt: new Date()
        }
      })
    })

    console.log(`[Account Link] ✅ Successfully linked accounts (via host link):`)
    console.log(`   Host User: ${linkRequest.initiatingUserId}`)
    console.log(`   Guest User: ${targetUser.id}`)
    console.log(`   Legacy Dual ID: ${legacyDualId}`)

    // Send thank-you emails to both parties
    const hostEmail = user.email || 'Host Account'
    const guestEmail = targetUser.email || linkRequest.targetEmail

    // Send to guest
    try {
      const guestHtmlContent = generateThankYouEmail(guestEmail, hostEmail, 'guest')
      const guestTextContent = `
Your accounts are now linked!

Your guest account (${guestEmail}) has been successfully linked with the host account (${hostEmail}).

You can now switch between roles seamlessly using the role switcher in the header.

- ItWhip Team
      `.trim()

      await sendEmail(
        guestEmail,
        'ItWhip - Your Accounts Are Now Linked!',
        guestHtmlContent,
        guestTextContent
      )
      console.log(`[Account Link] Thank-you email sent to guest: ${guestEmail}`)
    } catch (emailError) {
      console.error('[Account Link] Failed to send thank-you email to guest:', emailError)
    }

    // Send to host
    try {
      const hostHtmlContent = generateThankYouEmail(hostEmail, guestEmail, 'host')
      const hostTextContent = `
Your accounts are now linked!

Your host account (${hostEmail}) has been successfully linked with the guest account (${guestEmail}).

You can now switch between roles seamlessly using the role switcher in the header.

- ItWhip Team
      `.trim()

      await sendEmail(
        hostEmail,
        'ItWhip - Your Accounts Are Now Linked!',
        hostHtmlContent,
        hostTextContent
      )
      console.log(`[Account Link] Thank-you email sent to host: ${hostEmail}`)
    } catch (emailError) {
      console.error('[Account Link] Failed to send thank-you email to host:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Accounts successfully linked!',
      legacyDualId: legacyDualId,
      linkedAccount: {
        email: guestEmail,
        name: targetUser.name
      }
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
  const dashboardPath = userType === 'host' ? '/host/dashboard' : '/dashboard'

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
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}${dashboardPath}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
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
                      © 2025 ItWhip. All rights reserved.
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
