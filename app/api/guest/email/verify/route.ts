// app/api/guest/email/verify/route.ts
// Verify and complete email change when user clicks verification link
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'
import { syncEmailAcrossProfiles, syncPhoneAcrossProfiles } from '@/app/lib/dual-role/sync-profile'
import { sendEmailChangeNotification } from '@/app/lib/dual-role/notifications'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return redirectToError('Missing verification token')
    }

    // Verify the token
    const EMAIL_CHANGE_SECRET = new TextEncoder().encode(
      process.env.EMAIL_CHANGE_SECRET || process.env.JWT_SECRET || 'email-change-secret'
    )

    let payload: any
    try {
      const result = await jwtVerify(token, EMAIL_CHANGE_SECRET)
      payload = result.payload
    } catch (verifyError: any) {
      console.error('[Email Verify] Token verification failed:', verifyError)
      if (verifyError.code === 'ERR_JWT_EXPIRED') {
        return redirectToError('Verification link has expired. Please request a new one.')
      }
      return redirectToError('Invalid verification link')
    }

    // Validate payload
    if (payload.type !== 'email_change' || !payload.userId || !payload.newEmail) {
      return redirectToError('Invalid verification token')
    }

    const { userId, oldEmail, newEmail } = payload

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    })

    if (existingUser && existingUser.id !== userId) {
      return redirectToError('This email is already associated with another account')
    }

    // Get current user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return redirectToError('User not found')
    }

    // Sync email across all profiles (User, ReviewerProfile, RentalHost)
    const syncResult = await syncEmailAcrossProfiles(userId, newEmail, oldEmail)

    if (!syncResult.success) {
      console.error('[Email Verify] Sync failed:', syncResult.error)
      return redirectToError('Failed to update email. Please try again.')
    }

    // Also mark email as verified in ReviewerProfile
    try {
      await prisma.reviewerProfile.updateMany({
        where: { userId },
        data: {
          emailVerified: true
        }
      })
    } catch (updateError) {
      console.error('[Email Verify] Failed to mark email verified:', updateError)
      // Don't fail - email was changed successfully
    }

    console.log(`[Email Verify] Email changed for user ${userId}: ${oldEmail} -> ${newEmail}`)

    // Send confirmation emails
    try {
      const { sendEmail } = await import('@/app/lib/email/sender')

      // Confirmation to NEW email
      const confirmHtml = generateEmailChangedConfirmation(user.name || 'User', oldEmail, newEmail)
      const confirmText = `
Email Changed Successfully

Hi ${user.name || 'User'},

Your ItWhip account email has been successfully changed from ${oldEmail} to ${newEmail}.

You'll now use your new email address to log in.

If you didn't make this change, please contact us immediately at info@itwhip.com

- ItWhip Team
      `.trim()

      await sendEmail(
        newEmail,
        'Email Changed Successfully - ItWhip',
        confirmHtml,
        confirmText
      )

      // Security notice to OLD email
      const noticeHtml = generateEmailChangedNotice(user.name || 'User', newEmail)
      const noticeText = `
Email Address Changed

Hi ${user.name || 'User'},

Your ItWhip account email has been changed to ${newEmail}.

If you didn't make this change, please contact us immediately at info@itwhip.com

- ItWhip Security Team
      `.trim()

      await sendEmail(
        oldEmail,
        'Your Email Address Has Been Changed - ItWhip',
        noticeHtml,
        noticeText
      )
    } catch (emailError) {
      console.error('[Email Verify] Confirmation emails failed:', emailError)
      // Don't fail - email was changed successfully
    }

    // Redirect to success page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'
    return NextResponse.redirect(`${baseUrl}/profile?emailChanged=true`)

  } catch (error) {
    console.error('[Email Verify] Error:', error)
    return redirectToError('An error occurred while verifying your email')
  }
}

function redirectToError(message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'
  const errorUrl = `${baseUrl}/profile?emailError=${encodeURIComponent(message)}`
  return NextResponse.redirect(errorUrl)
}

function generateEmailChangedConfirmation(name: string, oldEmail: string, newEmail: string): string {
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
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Email Changed</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="display: inline-block; background-color: #d1fae5; padding: 16px; border-radius: 50%;">
                        <span style="font-size: 32px;">✓</span>
                      </div>
                    </div>

                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600; text-align: center;">Email Changed Successfully</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Your ItWhip account email has been successfully updated.
                    </p>

                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Previous email:</td>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px; text-decoration: line-through;">${oldEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">New email:</td>
                          <td style="padding: 4px 0; color: #10b981; font-size: 14px; font-weight: 600;">${newEmail}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      You'll now use your new email address to log in to your account.
                    </p>

                    <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                        <strong>Didn't make this change?</strong> Contact us immediately at <a href="mailto:info@itwhip.com" style="color: #92400e;">info@itwhip.com</a>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      &copy; 2025 ItWhip. All rights reserved.
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

function generateEmailChangedNotice(name: string, newEmail: string): string {
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
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ItWhip</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Security Alert</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Your Email Address Has Been Changed</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      The email address on your ItWhip account has been changed to:
                    </p>

                    <div style="background-color: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">${newEmail}</p>
                    </div>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      <strong>If you made this change:</strong> No further action is needed. You can safely delete this email.
                    </p>

                    <div style="padding: 20px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">
                        Didn't make this change?
                      </p>
                      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                        Someone may have access to your account. Contact us immediately at <a href="mailto:info@itwhip.com" style="color: #991b1b; font-weight: 600;">info@itwhip.com</a>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      &copy; 2025 ItWhip. All rights reserved.
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
