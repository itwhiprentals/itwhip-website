// app/lib/dual-role/suspension.ts
// Suspension management system with automatic escalation rules
// Follows Turo/Airbnb/Uber best practices for role-specific vs account-wide suspensions

import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'

export type SuspensionSeverity = 'MINOR' | 'MODERATE' | 'SEVERE'
export type SuspensionRole = 'guest' | 'host' | 'both'

/**
 * Escalation rules: Determines which roles are affected by each violation type
 * - 'both': Severe violations that affect entire account (fraud, safety)
 * - 'guest' or 'host': Role-specific violations (late cancellation, listing issues)
 */
const ESCALATION_RULES: Record<string, SuspensionRole> = {
  // Severe violations - affect both roles
  'fraud': 'both',
  'safety_violation': 'both',
  'identity_theft': 'both',
  'payment_fraud': 'both',
  'repeated_violations': 'both',
  'criminal_activity': 'both',
  'harassment': 'both',
  'policy_abuse': 'both',

  // Minor violations - role-specific
  'late_cancellation': 'guest',
  'no_show': 'guest',
  'vehicle_damage': 'guest',
  'excessive_mileage': 'guest',
  'cleanliness_issue': 'guest',
  'poor_communication': 'host',
  'listing_inaccuracy': 'host',
  'vehicle_maintenance': 'host',
  'delayed_response': 'host',
  'pricing_violation': 'host'
}

/**
 * Suspends a user account with automatic escalation based on violation type
 * Sends notification emails and logs the suspension
 */
export async function suspendUser(params: {
  userId: string
  role: SuspensionRole
  reason: string
  severity: SuspensionSeverity
  violationType: string
  expiresAt?: Date
  suspendedBy: string
}) {
  const { userId, role, reason, severity, violationType, expiresAt, suspendedBy } = params

  console.log('[Suspension] Processing:', {
    userId,
    role,
    violationType,
    severity,
    reason
  })

  // Determine if escalation needed based on violation type
  const shouldEscalate = ESCALATION_RULES[violationType] === 'both'
  const effectiveRole = shouldEscalate ? 'both' : role

  console.log('[Suspension] Escalation check:', {
    violationType,
    escalationRule: ESCALATION_RULES[violationType],
    shouldEscalate,
    requestedRole: role,
    effectiveRole
  })

  const suspensionData = {
    suspendedAt: new Date(),
    suspendedReason: reason,
    suspendedBy: suspendedBy,
    ...(expiresAt && { suspensionExpiresAt: expiresAt })
  }

  try {
    // Apply suspension to affected roles
    if (effectiveRole === 'both' || effectiveRole === 'guest') {
      const updateResult = await prisma.reviewerProfile.updateMany({
        where: { userId },
        data: {
          ...suspensionData,
          suspensionLevel: severity === 'SEVERE' ? 'BANNED' : 'HARD',
          ...(severity === 'SEVERE' && { bannedAt: new Date(), banReason: reason })
        }
      })

      console.log('[Suspension] Guest profile updated:', updateResult.count, 'records')
    }

    if (effectiveRole === 'both' || effectiveRole === 'host') {
      const updateResult = await prisma.rentalHost.updateMany({
        where: { userId },
        data: {
          ...suspensionData,
          approvalStatus: 'SUSPENDED'
        }
      })

      console.log('[Suspension] Host profile updated:', updateResult.count, 'records')
    }

    // Get user info for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!user?.email) {
      console.warn('[Suspension] User email not found, skipping notification')
      return { success: true, escalated: shouldEscalate, affectedRole: effectiveRole }
    }

    // Send notification email
    await sendSuspensionNotification(
      user.name || 'User',
      user.email,
      effectiveRole,
      reason,
      expiresAt,
      shouldEscalate
    )

    console.log('[Suspension] ✅ Successfully suspended user')
    return { success: true, escalated: shouldEscalate, affectedRole: effectiveRole }

  } catch (error) {
    console.error('[Suspension] ❌ Error:', error)
    throw error
  }
}

/**
 * Sends suspension notification email to user
 * Includes details about which roles are affected and expiration if applicable
 */
async function sendSuspensionNotification(
  name: string,
  email: string,
  role: SuspensionRole,
  reason: string,
  expiresAt?: Date,
  escalated?: boolean
) {
  const roleText = role === 'both' ? 'host and guest accounts' : `${role} account`
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">⚠️ Account Suspension Notice</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">ItWhip Account Suspension</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Hi ${name},
                    </p>

                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                      Your ${roleText} ${role === 'both' ? 'have' : 'has'} been suspended as of ${timestamp}.
                    </p>

                    <div style="background: #fee2e2; padding: 20px; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">Reason for Suspension:</p>
                      <p style="margin: 0; color: #7f1d1d; font-size: 16px; font-weight: 500;">${reason}</p>
                    </div>

                    ${escalated ? `
                    <div style="background: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #92400e;">⚠️ Escalated Violation:</strong><br>
                      <span style="color: #78350f; font-size: 14px;">Due to the severity of this violation, both your host and guest accounts have been suspended for your safety and the safety of the ItWhip community.</span>
                    </div>
                    ` : ''}

                    ${expiresAt ? `
                    <div style="background: #dbeafe; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #1e40af;">🕒 Suspension Duration:</strong><br>
                      <span style="color: #1e3a8a; font-size: 14px;">This suspension will automatically expire on <strong>${expiresAt.toLocaleString('en-US', { dateStyle: 'long' })}</strong>.</span>
                    </div>
                    ` : `
                    <div style="background: #fee2e2; padding: 16px; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 24px;">
                      <strong style="color: #991b1b;">🚫 Permanent Suspension:</strong><br>
                      <span style="color: #7f1d1d; font-size: 14px;">This is a permanent suspension. If you believe this is an error, please contact our support team immediately.</span>
                    </div>
                    `}

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 20px;">
                        <strong>What this means:</strong>
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 24px;">
                        ${role === 'both' || role === 'guest' ? '<li>You cannot book or rent vehicles</li>' : ''}
                        ${role === 'both' || role === 'host' ? '<li>You cannot list or manage vehicles</li>' : ''}
                        ${role === 'both' || role === 'host' ? '<li>Active bookings may be cancelled</li>' : ''}
                        <li>You can still access account settings and support</li>
                      </ul>
                    </div>

                    <div style="margin-top: 30px; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'}/support" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
                        Contact Support
                      </a>
                    </div>

                    <p style="margin: 20px 0 0; color: #6b7280; font-size: 12px; line-height: 18px; text-align: center;">
                      If you have questions about this suspension, please contact our support team at
                      <a href="mailto:info@itwhip.com" style="color: #3b82f6; text-decoration: none;">info@itwhip.com</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2026 ItWhip. This is an automated notification.
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

  try {
    await sendEmail(email, 'ItWhip Account Suspended', html, '')
    console.log('[Suspension Notification] ✅ Email sent successfully')
  } catch (error) {
    console.error('[Suspension Notification] ❌ Failed to send email:', error)
    // Don't throw - suspension should still succeed even if email fails
  }
}

/**
 * Lifts suspension from user account
 * Can target specific role or both
 */
export async function unsuspendUser(
  userId: string,
  role: SuspensionRole = 'both'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Unsuspend] Lifting suspension:', { userId, role })

    if (role === 'both' || role === 'guest') {
      await prisma.reviewerProfile.updateMany({
        where: { userId },
        data: {
          suspensionLevel: null,
          suspendedAt: null,
          suspendedReason: null,
          suspendedBy: null,
          suspensionExpiresAt: null
        }
      })
    }

    if (role === 'both' || role === 'host') {
      await prisma.rentalHost.updateMany({
        where: { userId },
        data: {
          approvalStatus: 'APPROVED', // Or keep existing status?
          suspendedAt: null,
          suspendedReason: null
        }
      })
    }

    console.log('[Unsuspend] ✅ Successfully lifted suspension')
    return { success: true }
  } catch (error) {
    console.error('[Unsuspend] ❌ Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to lift suspension'
    }
  }
}
