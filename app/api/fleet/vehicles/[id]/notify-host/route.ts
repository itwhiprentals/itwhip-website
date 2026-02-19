// app/api/fleet/vehicles/[id]/notify-host/route.ts
// Send a system email + SMS to the host about vehicle listing issues

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { logEmail, generateEmailReference, emailConfig } from '@/app/lib/email/config'
import { sendSms } from '@/app/lib/twilio/sms'
import { vehicleIssuesHost } from '@/app/lib/twilio/sms-templates'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

// POST /api/fleet/vehicles/[id]/notify-host
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { overrideEmail, overridePhone } = body

    // Fetch vehicle with all data needed to compute blockers
    const vehicle: any = await prisma.rentalCar.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            approvalStatus: true,
            documentsVerified: true,
            isVerified: true,
            photoIdVerified: true,
            stripeConnectAccountId: true,
            stripePayoutsEnabled: true,
            stripeChargesEnabled: true,
            bankVerified: true,
          }
        },
        photos: {
          select: { id: true },
          take: 1
        },
        _count: {
          select: { photos: true }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    if (!vehicle.host) {
      return NextResponse.json({ error: 'Vehicle has no host assigned' }, { status: 400 })
    }

    // Compute listing blockers (same logic as GET handler)
    const blockers: { key: string; label: string; severity: 'error' | 'warning' }[] = []
    const photoCount = vehicle._count.photos

    if (vehicle.host?.approvalStatus !== 'APPROVED') blockers.push({ key: 'host_not_approved', label: `Host status: ${vehicle.host?.approvalStatus || 'N/A'}`, severity: 'error' })
    if (vehicle.dailyRate <= 0) blockers.push({ key: 'no_rate', label: 'Daily rate is $0 — not set', severity: 'error' })
    if (photoCount === 0) blockers.push({ key: 'no_photos', label: 'No photos uploaded', severity: 'error' })
    if (vehicle.hasActiveClaim) blockers.push({ key: 'active_claim', label: 'Active insurance claim on vehicle', severity: 'error' })
    if (vehicle.safetyHold) blockers.push({ key: 'safety_hold', label: `Safety hold: ${vehicle.safetyHoldReason || 'contact fleet'}`, severity: 'error' })
    if (vehicle.requiresInspection) blockers.push({ key: 'inspection', label: 'Requires inspection before listing', severity: 'warning' })
    if (!vehicle.host?.stripePayoutsEnabled) blockers.push({ key: 'stripe_payouts', label: 'Stripe payouts not enabled — complete banking setup', severity: 'warning' })
    if (!vehicle.host?.documentsVerified) blockers.push({ key: 'docs_not_verified', label: 'Documents not yet verified', severity: 'warning' })
    if (vehicle.year < 2015 && vehicle.vehicleType === 'RENTAL') blockers.push({ key: 'old_vehicle', label: `${vehicle.year} vehicle — only 2015+ qualify as Rental. Please update the vehicle type to Rideshare in your dashboard.`, severity: 'warning' })
    if (!vehicle.address || !vehicle.city) blockers.push({ key: 'no_location', label: 'Pickup location not set', severity: 'warning' })
    if (!vehicle.transmission) blockers.push({ key: 'no_transmission', label: 'Transmission type not set', severity: 'warning' })
    if (!vehicle.licensePlate) blockers.push({ key: 'no_plate', label: 'License plate not entered', severity: 'warning' })

    if (blockers.length === 0) {
      return NextResponse.json(
        { error: 'No issues found for this vehicle — nothing to report' },
        { status: 400 }
      )
    }

    // Determine recipient email
    const recipientEmail = overrideEmail?.trim() || vehicle.host.email
    if (!recipientEmail) {
      return NextResponse.json({ error: 'No email address for host' }, { status: 400 })
    }

    const firstName = vehicle.host.name?.split(' ')[0] || vehicle.host.name || 'there'
    const carName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    const errorCount = blockers.filter(b => b.severity === 'error').length
    const warningCount = blockers.filter(b => b.severity === 'warning').length
    const totalCount = blockers.length

    const subject = `Action needed: ${carName} — ${totalCount} listing issue${totalCount !== 1 ? 's' : ''}`

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    const fixUrl = `${baseUrl}/partner/fleet/${vehicle.id}`

    // Generate reference ID upfront so we can include it in the email
    const emailReferenceId = generateEmailReference('VH')

    // Build issues rows for the email
    const issueRows = blockers.map(b => {
      const isError = b.severity === 'error'
      const icon = isError
        ? `<span style="color: #dc2626; font-weight: bold; font-size: 16px;">&#10007;</span>` // ✗
        : `<span style="color: #d97706; font-weight: bold; font-size: 16px;">&#9888;</span>` // ⚠
      const textColor = isError ? '#dc2626' : '#92400e'
      const bgColor = isError ? '#fef2f2' : '#fffbeb'
      const borderColor = isError ? '#fecaca' : '#fde68a'

      return `
        <tr>
          <td style="padding: 10px 12px; background-color: ${bgColor}; border-bottom: 1px solid ${borderColor};">
            <span style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="flex-shrink: 0; margin-top: 1px;">${icon}</span>
              <span style="color: ${textColor}; font-size: 14px; line-height: 1.5;">${b.label}</span>
            </span>
          </td>
        </tr>
      `
    }).join('')

    // Issue count summary line
    const issueSummary = [
      errorCount > 0 ? `${errorCount} blocking error${errorCount !== 1 ? 's' : ''}` : '',
      warningCount > 0 ? `${warningCount} warning${warningCount !== 1 ? 's' : ''}` : '',
    ].filter(Boolean).join(', ')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 20px;">

        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <div style="background-color: #1f2937; padding: 24px; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Vehicle Listing Issues</p>
            <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">${carName}</h1>
          </div>

          <!-- Body -->
          <div style="padding: 28px 28px 0 28px;">

            <p style="font-size: 15px; margin: 0 0 8px 0; color: #1f2937;">
              Hi ${firstName},
            </p>

            <p style="font-size: 14px; margin: 0 0 20px 0; color: #374151; line-height: 1.6;">
              Your vehicle <strong>${carName}</strong> has <strong>${totalCount} issue${totalCount !== 1 ? 's' : ''}</strong> (${issueSummary}) that need to be resolved before it can appear in guest search on ItWhip.
            </p>

            <!-- Issues Table -->
            <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
              <div style="background-color: #f3f4f6; padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Issues to resolve</p>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                ${issueRows}
              </table>
            </div>

            <!-- What to do -->
            <p style="font-size: 14px; margin: 0 0 8px 0; color: #374151; line-height: 1.6;">
              Please log in to your partner dashboard to resolve these issues. Once all errors are cleared, your vehicle will be automatically listed for guests to find.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${fixUrl}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 6px;">
                Fix Issues Now
              </a>
            </div>

            <p style="font-size: 13px; margin: 0 0 24px 0; color: #6b7280; text-align: center;">
              Or copy this link: <a href="${fixUrl}" style="color: #ea580c;">${fixUrl}</a>
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

            <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0;">
              Questions? Reply to this email or visit <a href="${emailConfig.helpUrl}" style="color: #ea580c;">${emailConfig.helpUrl}</a>
            </p>

          </div>

          <!-- Footer -->
          <div style="padding: 20px 28px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">

            <!-- Social icons -->
            <div style="text-align: center; margin-bottom: 12px;">
              <a href="${emailConfig.social.instagram}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.instagram}" alt="Instagram" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.facebook}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.facebook}" alt="Facebook" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.twitter}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.twitter}" alt="X" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.linkedin}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.linkedin}" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;" /></a>
            </div>

            <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">
              ${emailConfig.companyName} &bull; ${emailConfig.companyAddress}
            </p>

            <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af; text-align: center;">
              <a href="${emailConfig.termsUrl}" style="color: #9ca3af;">Terms</a>
              &nbsp;&bull;&nbsp;
              <a href="${emailConfig.privacyUrl}" style="color: #9ca3af;">Privacy</a>
              &nbsp;&bull;&nbsp;
              <a href="${emailConfig.aboutUrl}" style="color: #9ca3af;">About</a>
            </p>

            <p style="margin: 0; font-size: 10px; color: #d1d5db; text-align: center;">
              Reference: <a href="${emailConfig.websiteUrl}/verify?ref=${emailReferenceId}" style="color: #d1d5db;">${emailReferenceId}</a>
            </p>

          </div>
        </div>

      </body>
      </html>
    `

    const text = `
Hi ${firstName},

Your vehicle ${carName} has ${totalCount} issue(s) that need to be resolved before it can be listed on ItWhip.

Issues (${issueSummary}):
${blockers.map(b => `${b.severity === 'error' ? '✗' : '⚠'} ${b.label}`).join('\n')}

Please log in to your partner dashboard to fix these issues:
${fixUrl}

Questions? Reply to this email or visit ${emailConfig.helpUrl}

—
${emailConfig.companyName}
${emailConfig.companyAddress}
${emailConfig.websiteUrl}

Reference: ${emailReferenceId}
    `.trim()

    // Send the email
    const emailResult = await sendEmail(
      recipientEmail,
      subject,
      html,
      text,
      { requestId: `vehicle-issues-${id}` }
    )

    // Log to EmailLog for audit trail
    await logEmail({
      recipientEmail,
      recipientName: vehicle.host.name,
      subject,
      emailType: 'SYSTEM',
      relatedType: 'vehicle_issues',
      relatedId: id,
      messageId: emailResult.messageId,
      referenceId: emailReferenceId,
      metadata: {
        vehicleId: id,
        carName,
        hostId: vehicle.host.id,
        hostOriginalEmail: vehicle.host.email,
        overrideEmailUsed: !!overrideEmail && overrideEmail !== vehicle.host.email,
        blockerCount: blockers.length,
        errorCount,
        warningCount,
        blockers: blockers.map(b => ({ key: b.key, severity: b.severity })),
      }
    })

    // Log in ActivityLog
    try {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'HOST_NOTIFIED_VEHICLE_ISSUES',
          entityType: 'RentalCar',
          entityId: id,
          hostId: vehicle.hostId,
          metadata: {
            vehicleId: id,
            carName,
            recipientEmail,
            emailReferenceId,
            blockerCount: blockers.length,
            adminAction: 'fleet_admin'
          }
        }
      })
    } catch (logErr) {
      // Non-blocking
      console.error('[notify-host] ActivityLog error:', logErr)
    }

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          emailSent: false,
          error: emailResult.error || 'Failed to send email'
        },
        { status: 500 }
      )
    }

    // Send SMS to host (non-blocking — don't fail the request if SMS fails)
    let smsSid: string | undefined
    const hostPhone = overridePhone?.trim() || vehicle.host.phone
    if (hostPhone) {
      try {
        const smsBody = vehicleIssuesHost({
          carName,
          issueCount: blockers.length,
          vehicleId: id,
        })
        const smsResult = await sendSms(hostPhone, smsBody, {
          type: 'SYSTEM',
          hostId: vehicle.host.id,
        })
        if (smsResult.success) {
          smsSid = smsResult.sid
          console.log(`[notify-host] SMS sent to host: ${smsResult.sid}`)
        } else {
          console.warn(`[notify-host] SMS failed (non-blocking): ${smsResult.error}`)
        }
      } catch (smsErr) {
        console.error('[notify-host] SMS error (non-blocking):', smsErr)
      }
    } else {
      console.log('[notify-host] No phone on file for host — skipping SMS')
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      smsSent: !!smsSid,
      messageId: emailResult.messageId,
      smsSid,
      referenceId: emailReferenceId,
      sentTo: recipientEmail,
      blockerCount: blockers.length
    })

  } catch (error: any) {
    console.error('[notify-host] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    )
  }
}
