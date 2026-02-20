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
    const {
      overrideEmail,
      overridePhone,
      messageType = 'issues',
      customMessage,
      selectedIssues,
      includeListingLink = true
    } = body

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

    // For issues mode, require blockers
    if (messageType === 'issues' && blockers.length === 0) {
      return NextResponse.json(
        { error: 'No issues found for this vehicle — nothing to report' },
        { status: 400 }
      )
    }

    // For custom mode, require either a message or selected issues
    if (messageType === 'custom' && !customMessage?.trim() && (!selectedIssues || selectedIssues.length === 0)) {
      return NextResponse.json(
        { error: 'Please provide a message or select at least one issue' },
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
    const fixUrl = `${baseUrl}/partner/fleet/${vehicle.id}`
    const emailReferenceId = generateEmailReference('VH')

    // Build email content based on message type
    let subject: string
    let html: string
    let text: string
    let logAction: string

    // Common issue labels for custom mode dropdown
    const issueLabels: Record<string, string> = {
      no_plate: 'License plate missing',
      adjust_price: 'Daily rate needs adjustment',
      update_photos: 'Photos need updating',
      insurance_docs: 'Insurance documents needed',
      stripe_setup: 'Stripe payouts not set up',
      no_description: 'Vehicle description missing',
      incomplete_location: 'Pickup location incomplete',
      missing_vin: 'VIN number missing',
    }

    // Generate the public listing URL for the car
    const makeSlug = vehicle.make.toLowerCase().replace(/\s+/g, '-')
    const modelSlug = vehicle.model.toLowerCase().replace(/\s+/g, '-')
    const citySlug = (vehicle.city || 'phoenix').toLowerCase().replace(/\s+/g, '-')
    const listingUrl = `${baseUrl}/rentals/${vehicle.year}-${makeSlug}-${modelSlug}-${citySlug}-${vehicle.id}`

    if (messageType === 'custom') {
      // ── Custom message mode ──
      logAction = 'HOST_NOTIFIED_CUSTOM'
      subject = `Update on your ${carName} listing`

      const selectedIssueLabels = (selectedIssues || [])
        .map((key: string) => issueLabels[key])
        .filter(Boolean)

      const issueSection = selectedIssueLabels.length > 0 ? `
        <div style="border: 1px solid #fed7aa; border-radius: 6px; overflow: hidden; margin: 16px 0;">
          <div style="background-color: #fff7ed; padding: 10px 12px; border-bottom: 1px solid #fed7aa;">
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px;">Items to address</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            ${selectedIssueLabels.map((label: string) => `
              <tr><td style="padding: 8px 12px; background-color: #fff7ed; border-bottom: 1px solid #fed7aa;">
                <span style="color: #9a3412; font-size: 14px;">&#9888; ${label}</span>
              </td></tr>
            `).join('')}
          </table>
        </div>
      ` : ''

      const messageBody = customMessage?.trim()
        ? customMessage.trim().split('\n').map((line: string) => `<p style="font-size: 14px; margin: 0 0 8px 0; color: #374151; line-height: 1.6;">${line}</p>`).join('')
        : ''

      const listingLinkSection = includeListingLink ? `
        <div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #166534; font-weight: 600;">Your listing is live!</p>
          <a href="${listingUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 6px;">
            View Your Listing
          </a>
        </div>
      ` : ''

      html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background-color: #1f2937; padding: 24px; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Listing Update</p>
            <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">${carName}</h1>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 15px; margin: 0 0 12px 0; color: #1f2937;">Hi ${firstName},</p>
            ${messageBody}
            ${issueSection}
            ${listingLinkSection}
            <div style="text-align: center; margin: 20px 0;">
              <a href="${fixUrl}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 6px;">
                Go to Dashboard
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 13px; color: #6b7280; margin: 0;">Questions? Reply to this email or visit <a href="${emailConfig.helpUrl}" style="color: #ea580c;">${emailConfig.helpUrl}</a></p>
          </div>
          <div style="padding: 20px 28px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 12px;">
              <a href="${emailConfig.social.instagram}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.instagram}" alt="Instagram" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.facebook}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.facebook}" alt="Facebook" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.twitter}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.twitter}" alt="X" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.linkedin}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.linkedin}" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;" /></a>
            </div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">${emailConfig.companyName} &bull; ${emailConfig.companyAddress}</p>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af; text-align: center;"><a href="${emailConfig.termsUrl}" style="color: #9ca3af;">Terms</a> &bull; <a href="${emailConfig.privacyUrl}" style="color: #9ca3af;">Privacy</a> &bull; <a href="${emailConfig.aboutUrl}" style="color: #9ca3af;">About</a></p>
            <p style="margin: 0; font-size: 10px; color: #d1d5db; text-align: center;">Reference: <a href="${emailConfig.websiteUrl}/verify?ref=${emailReferenceId}" style="color: #d1d5db;">${emailReferenceId}</a></p>
          </div>
        </div>
      </body></html>`

      const issueLines = selectedIssueLabels.length > 0
        ? `\nItems to address:\n${selectedIssueLabels.map((l: string) => `⚠ ${l}`).join('\n')}\n`
        : ''

      text = `Hi ${firstName},\n\n${customMessage?.trim() || ''}${issueLines}${includeListingLink ? `\nView your listing: ${listingUrl}\n` : ''}\nDashboard: ${fixUrl}\n\n—\n${emailConfig.companyName}\nReference: ${emailReferenceId}`

    } else {
      // ── Issues mode (original behavior) ──
      logAction = 'HOST_NOTIFIED_VEHICLE_ISSUES'
      const errorCount = blockers.filter(b => b.severity === 'error').length
      const warningCount = blockers.filter(b => b.severity === 'warning').length
      const totalCount = blockers.length
      subject = `Action needed: ${carName} — ${totalCount} listing issue${totalCount !== 1 ? 's' : ''}`

      const issueRows = blockers.map(b => {
        const isError = b.severity === 'error'
        const icon = isError ? `<span style="color: #dc2626; font-weight: bold; font-size: 16px;">&#10007;</span>` : `<span style="color: #d97706; font-weight: bold; font-size: 16px;">&#9888;</span>`
        const textColor = isError ? '#dc2626' : '#92400e'
        const bgColor = isError ? '#fef2f2' : '#fffbeb'
        const borderColor = isError ? '#fecaca' : '#fde68a'
        return `<tr><td style="padding: 10px 12px; background-color: ${bgColor}; border-bottom: 1px solid ${borderColor};"><span style="display: flex; align-items: flex-start; gap: 8px;"><span style="flex-shrink: 0; margin-top: 1px;">${icon}</span><span style="color: ${textColor}; font-size: 14px; line-height: 1.5;">${b.label}</span></span></td></tr>`
      }).join('')

      const issueSummary = [
        errorCount > 0 ? `${errorCount} blocking error${errorCount !== 1 ? 's' : ''}` : '',
        warningCount > 0 ? `${warningCount} warning${warningCount !== 1 ? 's' : ''}` : '',
      ].filter(Boolean).join(', ')

      html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background-color: #1f2937; padding: 24px; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Vehicle Listing Issues</p>
            <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">${carName}</h1>
          </div>
          <div style="padding: 28px 28px 0 28px;">
            <p style="font-size: 15px; margin: 0 0 8px 0; color: #1f2937;">Hi ${firstName},</p>
            <p style="font-size: 14px; margin: 0 0 20px 0; color: #374151; line-height: 1.6;">Your vehicle <strong>${carName}</strong> has <strong>${totalCount} issue${totalCount !== 1 ? 's' : ''}</strong> (${issueSummary}) that need to be resolved before it can appear in guest search on ItWhip.</p>
            <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
              <div style="background-color: #f3f4f6; padding: 10px 12px; border-bottom: 1px solid #e5e7eb;"><p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Issues to resolve</p></div>
              <table style="width: 100%; border-collapse: collapse;">${issueRows}</table>
            </div>
            <p style="font-size: 14px; margin: 0 0 8px 0; color: #374151; line-height: 1.6;">Please log in to your partner dashboard to resolve these issues. Once all errors are cleared, your vehicle will be automatically listed for guests to find.</p>
            <div style="text-align: center; margin: 24px 0;"><a href="${fixUrl}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 6px;">Fix Issues Now</a></div>
            <p style="font-size: 13px; margin: 0 0 24px 0; color: #6b7280; text-align: center;">Or copy this link: <a href="${fixUrl}" style="color: #ea580c;">${fixUrl}</a></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0;">Questions? Reply to this email or visit <a href="${emailConfig.helpUrl}" style="color: #ea580c;">${emailConfig.helpUrl}</a></p>
          </div>
          <div style="padding: 20px 28px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 12px;">
              <a href="${emailConfig.social.instagram}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.instagram}" alt="Instagram" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.facebook}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.facebook}" alt="Facebook" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.twitter}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.twitter}" alt="X" width="24" height="24" style="vertical-align: middle;" /></a>
              <a href="${emailConfig.social.linkedin}" style="display: inline-block; margin: 0 4px;"><img src="${emailConfig.socialIcons.linkedin}" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;" /></a>
            </div>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af; text-align: center;">${emailConfig.companyName} &bull; ${emailConfig.companyAddress}</p>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #9ca3af; text-align: center;"><a href="${emailConfig.termsUrl}" style="color: #9ca3af;">Terms</a> &bull; <a href="${emailConfig.privacyUrl}" style="color: #9ca3af;">Privacy</a> &bull; <a href="${emailConfig.aboutUrl}" style="color: #9ca3af;">About</a></p>
            <p style="margin: 0; font-size: 10px; color: #d1d5db; text-align: center;">Reference: <a href="${emailConfig.websiteUrl}/verify?ref=${emailReferenceId}" style="color: #d1d5db;">${emailReferenceId}</a></p>
          </div>
        </div>
      </body></html>`

      text = `Hi ${firstName},\n\nYour vehicle ${carName} has ${totalCount} issue(s) that need to be resolved before it can be listed on ItWhip.\n\nIssues (${issueSummary}):\n${blockers.map(b => `${b.severity === 'error' ? '✗' : '⚠'} ${b.label}`).join('\n')}\n\nPlease log in to your partner dashboard to fix these issues:\n${fixUrl}\n\nQuestions? Reply to this email or visit ${emailConfig.helpUrl}\n\n—\n${emailConfig.companyName}\n${emailConfig.companyAddress}\n${emailConfig.websiteUrl}\n\nReference: ${emailReferenceId}`
    }

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
      relatedType: messageType === 'custom' ? 'vehicle_update' : 'vehicle_issues',
      relatedId: id,
      messageId: emailResult.messageId,
      referenceId: emailReferenceId,
      metadata: messageType === 'custom' ? {
        vehicleId: id,
        carName,
        hostId: vehicle.host.id,
        hostOriginalEmail: vehicle.host.email,
        overrideEmailUsed: !!overrideEmail && overrideEmail !== vehicle.host.email,
        messageType: 'custom',
        selectedIssues: selectedIssues || [],
        hasCustomMessage: !!customMessage?.trim(),
        includeListingLink,
      } : {
        vehicleId: id,
        carName,
        hostId: vehicle.host.id,
        hostOriginalEmail: vehicle.host.email,
        overrideEmailUsed: !!overrideEmail && overrideEmail !== vehicle.host.email,
        blockerCount: blockers.length,
        errorCount: blockers.filter(b => b.severity === 'error').length,
        warningCount: blockers.filter(b => b.severity === 'warning').length,
        blockers: blockers.map(b => ({ key: b.key, severity: b.severity })),
      }
    })

    // Log in ActivityLog
    try {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: logAction,
          entityType: 'RentalCar',
          entityId: id,
          hostId: vehicle.hostId,
          metadata: {
            vehicleId: id,
            carName,
            recipientEmail,
            emailReferenceId,
            messageType,
            ...(messageType === 'custom'
              ? { selectedIssues: selectedIssues || [], hasCustomMessage: !!customMessage?.trim(), includeListingLink }
              : { blockerCount: blockers.length }),
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
        const smsBody = messageType === 'custom'
          ? `Hi ${firstName}, you have an update about your ${carName} listing on ItWhip. Check your email for details. Dashboard: ${fixUrl}`
          : vehicleIssuesHost({
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
      messageType,
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
