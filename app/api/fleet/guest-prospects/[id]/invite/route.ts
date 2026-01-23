// app/api/fleet/guest-prospects/[id]/invite/route.ts
// Send or resend invite email to a guest prospect with credit incentive

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/app/lib/email/sender'

// POST /api/fleet/guest-prospects/[id]/invite - Send invite email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.guestProspect.findUnique({
      where: { id }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Guest prospect not found' },
        { status: 404 }
      )
    }

    // Check if already converted
    if (prospect.convertedProfileId) {
      return NextResponse.json(
        { error: 'This prospect has already created an account' },
        { status: 400 }
      )
    }

    // Generate new invite token (72 hours for guests)
    const inviteToken = nanoid(32)
    const inviteTokenExp = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours

    // Update prospect with new token
    const updatedProspect = await prisma.guestProspect.update({
      where: { id },
      data: {
        inviteToken,
        inviteTokenExp,
        inviteSentAt: new Date(),
        inviteResendCount: { increment: 1 },
        lastResendAt: new Date(),
        status: 'INVITED'
      }
    })

    // Log activity
    await prisma.guestProspectActivity.create({
      data: {
        prospectId: id,
        activityType: 'EMAIL_SENT',
        metadata: {
          resendCount: updatedProspect.inviteResendCount,
          tokenExpiry: inviteTokenExp.toISOString()
        }
      }
    })

    // Build the invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/guest-invite?token=${inviteToken}`

    // Get first name only
    const firstName = prospect.name.split(' ')[0]

    // Build email subject
    const creditDisplay = prospect.creditAmount > 0 ? `$${prospect.creditAmount.toFixed(0)}` : ''
    const subject = creditDisplay
      ? `${firstName}, You've Got ${creditDisplay} in Rental Credit!`
      : `${firstName}, You're Invited to ItWhip!`

    // Format credit type for display
    const creditTypeDisplay = prospect.creditType === 'bonus'
      ? 'Bonus Credit'
      : prospect.creditType === 'deposit'
        ? 'Deposit Credit'
        : 'Rental Credit'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">${prospect.creditAmount > 0 ? 'Your Rental Credit Is Ready' : 'You\'re Invited'}</p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">${prospect.creditAmount > 0 ? `$${prospect.creditAmount.toFixed(0)} Welcome Gift Inside` : 'Welcome to ItWhip'}</h1>
        </div>

        <!-- Main content -->
        <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
          Hi ${firstName},
        </p>

        <p style="font-size: 16px; margin: 0 0 16px 0; color: #374151;">
          ${prospect.creditAmount > 0
            ? `Great news! You've been gifted <strong>$${prospect.creditAmount.toFixed(0)} in ${creditTypeDisplay.toLowerCase()}</strong> toward your first rental with ItWhip.`
            : 'You\'ve been invited to rent a car through ItWhip! Create your account to browse our selection of vehicles from trusted local hosts.'}
        </p>

        <p style="font-size: 16px; color: #374151; margin: 0;">
          Click below to claim your credit and start browsing cars.
        </p>

        ${prospect.creditAmount > 0 ? `
        <!-- Credit Display -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Your ${creditTypeDisplay}</p>
          <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">$${prospect.creditAmount.toFixed(0)}</p>
          ${prospect.creditNote ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">"${prospect.creditNote}"</p>` : ''}
          ${prospect.creditExpirationDays ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">Valid for ${prospect.creditExpirationDays} days after claim</p>` : ''}
        </div>
        ` : ''}

        <!-- Status indicator -->
        <p style="font-size: 14px; color: #374151; margin: 20px 0;">
          <strong>This credit is reserved for you.</strong> We're holding it for 72 hours so you have time to claim it.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
            ${prospect.creditAmount > 0 ? 'Claim Your Credit & Browse Cars' : 'Create Account & Browse Cars'}
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <!-- Benefits Section -->
        <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
          What you get with ItWhip:
        </p>
        <table style="width: 100%; font-size: 13px; color: #4b5563;">
          <tr>
            <td style="padding: 5px 0; width: 50%;">✓ Verified Hosts & Vehicles</td>
            <td style="padding: 5px 0; width: 50%;">✓ Flexible Pickup Locations</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Digital Rental Agreements</td>
            <td style="padding: 5px 0;">✓ 24/7 Support</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Competitive Daily Rates</td>
            <td style="padding: 5px 0;">✓ No Hidden Fees</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Unique Vehicle Selection</td>
            <td style="padding: 5px 0;">✓ Easy Booking Process</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Secure Payments via Stripe</td>
            <td style="padding: 5px 0;">✓ ID Verification for Safety</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">✓ Direct Host Communication</td>
            <td style="padding: 5px 0;">✓ Rental History & Receipts</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #6b7280; font-size: 13px; margin-bottom: 0; text-align: center;">
          Questions? Reply to this email or call <a href="tel:+13053999069" style="color: #ea580c; font-weight: 600;">(305) 399-9069</a>
        </p>

        <!-- About Us -->
        <p style="color: #9ca3af; font-size: 10px; margin-top: 16px; text-align: center; line-height: 1.4;">
          ItWhip is a peer-to-peer vehicle rental marketplace connecting verified renters with trusted vehicle owners.
          Find unique cars from local hosts at competitive rates.
          <a href="https://itwhip.com/how-it-works" style="color: #ea580c;">How It Works</a> |
          <a href="https://itwhip.com/cars" style="color: #ea580c;">Browse Cars</a>
        </p>

        <!-- Social Links with real SVG logos -->
        <table cellpadding="0" cellspacing="0" style="margin: 16px auto;">
          <tr>
            <!-- Instagram -->
            <td style="padding: 0 3px;">
              <a href="https://www.instagram.com/itwhipofficial" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E" alt="Instagram" width="14" height="14" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- Facebook -->
            <td style="padding: 0 3px;">
              <a href="https://www.facebook.com/people/Itwhipcom/61573990760395/" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: #1877f2; border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/%3E%3C/svg%3E" alt="Facebook" width="14" height="14" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- X (Twitter) -->
            <td style="padding: 0 3px;">
              <a href="https://x.com/itwhipofficial" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: #000000; border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E" alt="X" width="12" height="12" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <!-- LinkedIn -->
            <td style="padding: 0 3px;">
              <a href="https://www.linkedin.com/company/itwhip/" target="_blank" style="display: block; text-decoration: none;">
                <table cellpadding="0" cellspacing="0" width="25" height="25" style="background: #0a66c2; border-radius: 5px;">
                  <tr>
                    <td align="center" valign="middle" style="width: 25px; height: 25px;">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E" alt="LinkedIn" width="14" height="14" style="display: block; border: 0;" />
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>

        <p style="color: #9ca3af; font-size: 11px; margin-top: 8px; text-align: center;">
          ItWhip Rentals | Phoenix, AZ | <a href="https://itwhip.com" style="color: #ea580c;">itwhip.com</a>
          <br/>
          <a href="https://itwhip.com/about" style="color: #9ca3af;">About</a> |
          <a href="https://itwhip.com/terms" style="color: #9ca3af;">Terms</a> |
          <a href="https://itwhip.com/privacy" style="color: #9ca3af;">Privacy</a>
        </p>

        <!-- Tracking pixel for email open tracking -->
        <img src="${baseUrl}/api/tracking/guest-pixel/${id}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />
      </body>
      </html>
    `

    const text = `
${prospect.creditAmount > 0 ? 'YOUR RENTAL CREDIT IS READY' : 'YOU\'RE INVITED'}
${prospect.creditAmount > 0 ? `$${prospect.creditAmount.toFixed(0)} Welcome Gift Inside` : 'Welcome to ItWhip'}

Hi ${firstName},

${prospect.creditAmount > 0
  ? `Great news! You've been gifted $${prospect.creditAmount.toFixed(0)} in ${creditTypeDisplay.toLowerCase()} toward your first rental with ItWhip.`
  : 'You\'ve been invited to rent a car through ItWhip! Create your account to browse our selection of vehicles from trusted local hosts.'}

Click below to claim your credit and start browsing cars.

${prospect.creditAmount > 0 ? `YOUR ${creditTypeDisplay.toUpperCase()}: $${prospect.creditAmount.toFixed(0)}
${prospect.creditNote ? `"${prospect.creditNote}"` : ''}
${prospect.creditExpirationDays ? `Valid for ${prospect.creditExpirationDays} days after claim` : ''}` : ''}

This credit is reserved for you. We're holding it for 72 hours so you have time to claim it.

${prospect.creditAmount > 0 ? 'Claim Your Credit & Browse Cars' : 'Create Account & Browse Cars'}:
${inviteLink}

WHAT YOU GET WITH ITWHIP:
✓ Verified Hosts & Vehicles    ✓ Flexible Pickup Locations
✓ Digital Rental Agreements    ✓ 24/7 Support
✓ Competitive Daily Rates      ✓ No Hidden Fees
✓ Unique Vehicle Selection     ✓ Easy Booking Process
✓ Secure Payments via Stripe   ✓ ID Verification for Safety
✓ Direct Host Communication    ✓ Rental History & Receipts

Questions? Reply to this email or call (305) 399-9069

ItWhip is a peer-to-peer vehicle rental marketplace connecting verified renters with trusted vehicle owners. Find unique cars from local hosts at competitive rates.
How It Works: https://itwhip.com/how-it-works | Browse Cars: https://itwhip.com/cars

Follow us: Instagram @itwhipofficial | Facebook | X @itwhipofficial | LinkedIn

ItWhip Rentals | Phoenix, AZ | itwhip.com
About: https://itwhip.com/about | Terms: https://itwhip.com/terms | Privacy: https://itwhip.com/privacy
    `

    // Send the email
    console.log('[Guest Prospect Invite] Sending email to:', prospect.email)
    console.log('[Guest Prospect Invite] Invite link:', inviteLink)

    const emailResult = await sendEmail(
      prospect.email,
      subject,
      html,
      text,
      { requestId: `guest-prospect-invite-${id}` }
    )

    if (!emailResult.success) {
      console.error('[Guest Prospect Invite] Email failed:', emailResult.error)
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: emailResult.error,
        prospect: updatedProspect,
        inviteLink,
        expiresAt: inviteTokenExp
      })
    }

    console.log('[Guest Prospect Invite] Email sent successfully:', emailResult.messageId)

    return NextResponse.json({
      success: true,
      emailSent: true,
      messageId: emailResult.messageId,
      prospect: updatedProspect,
      inviteLink,
      expiresAt: inviteTokenExp
    })

  } catch (error: any) {
    console.error('[Fleet Guest Prospect Invite] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    )
  }
}
