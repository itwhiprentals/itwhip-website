// app/api/fleet/alert-settings/route.ts
// GET/PUT Fleet Alert Settings - Manage notification thresholds

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

// GET - Fetch current alert settings
export async function GET(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get or create default settings
    let settings = await prisma.fleet_alert_settings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.fleet_alert_settings.create({
        data: { id: 'global' }
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        // Email Settings
        alertEmailsEnabled: settings.alertEmailsEnabled,
        alertEmailRecipients: settings.alertEmailRecipients,
        emailDigestEnabled: settings.emailDigestEnabled,
        emailDigestFrequency: settings.emailDigestFrequency,

        // Partner Thresholds
        partnerPendingDaysWarning: settings.partnerPendingDaysWarning,
        suspendedPartnersAlert: settings.suspendedPartnersAlert,

        // Vehicle Thresholds
        pendingVehiclesAlert: settings.pendingVehiclesAlert,
        changesRequestedAlert: settings.changesRequestedAlert,

        // Booking Thresholds
        highCancellationThreshold: settings.highCancellationThreshold,
        bookingsStartingTodayAlert: settings.bookingsStartingTodayAlert,

        // Document Thresholds
        documentExpiryWarningDays: settings.documentExpiryWarningDays,
        documentExpiryUrgentDays: settings.documentExpiryUrgentDays,
        expiredDocumentsAlert: settings.expiredDocumentsAlert,
        pendingDocumentsAlert: settings.pendingDocumentsAlert,

        // Financial Thresholds
        negativeBalanceAlert: settings.negativeBalanceAlert,
        failedPayoutsAlert: settings.failedPayoutsAlert,
        pendingRefundThreshold: settings.pendingRefundThreshold,
        pendingRefundsAlert: settings.pendingRefundsAlert,

        // Claim Thresholds
        openClaimsAlert: settings.openClaimsAlert,

        // Review Thresholds
        lowRatingThreshold: settings.lowRatingThreshold,
        lowRatingsAlert: settings.lowRatingsAlert,

        // Security Thresholds
        securityEventsAlert: settings.securityEventsAlert,
        criticalSecurityThreshold: settings.criticalSecurityThreshold,

        // Performance Thresholds
        slowResponseThreshold: settings.slowResponseThreshold,
        criticalResponseThreshold: settings.criticalResponseThreshold,

        // Metadata
        lastEmailSentAt: settings.lastEmailSentAt?.toISOString() || null,
        lastDigestSentAt: settings.lastDigestSentAt?.toISOString() || null,
        updatedAt: settings.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('[Fleet Alert Settings] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Update alert settings
export async function PUT(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate email recipients if provided
    if (body.alertEmailRecipients) {
      if (!Array.isArray(body.alertEmailRecipients)) {
        return NextResponse.json({ error: 'alertEmailRecipients must be an array' }, { status: 400 })
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      for (const email of body.alertEmailRecipients) {
        if (!emailRegex.test(email)) {
          return NextResponse.json({ error: `Invalid email format: ${email}` }, { status: 400 })
        }
      }
    }

    // Validate digest frequency if provided
    if (body.emailDigestFrequency && !['instant', 'hourly', 'daily', 'weekly'].includes(body.emailDigestFrequency)) {
      return NextResponse.json({ error: 'emailDigestFrequency must be one of: instant, hourly, daily, weekly' }, { status: 400 })
    }

    // Validate numeric thresholds
    const numericFields = [
      'partnerPendingDaysWarning',
      'highCancellationThreshold',
      'documentExpiryWarningDays',
      'documentExpiryUrgentDays',
      'pendingRefundThreshold',
      'lowRatingThreshold',
      'criticalSecurityThreshold',
      'slowResponseThreshold',
      'criticalResponseThreshold'
    ]

    for (const field of numericFields) {
      if (body[field] !== undefined && (typeof body[field] !== 'number' || body[field] < 0)) {
        return NextResponse.json({ error: `${field} must be a positive number` }, { status: 400 })
      }
    }

    // Update settings
    const settings = await prisma.fleet_alert_settings.upsert({
      where: { id: 'global' },
      update: {
        // Email Settings
        ...(body.alertEmailsEnabled !== undefined && { alertEmailsEnabled: body.alertEmailsEnabled }),
        ...(body.alertEmailRecipients && { alertEmailRecipients: body.alertEmailRecipients }),
        ...(body.emailDigestEnabled !== undefined && { emailDigestEnabled: body.emailDigestEnabled }),
        ...(body.emailDigestFrequency && { emailDigestFrequency: body.emailDigestFrequency }),

        // Partner Thresholds
        ...(body.partnerPendingDaysWarning !== undefined && { partnerPendingDaysWarning: body.partnerPendingDaysWarning }),
        ...(body.suspendedPartnersAlert !== undefined && { suspendedPartnersAlert: body.suspendedPartnersAlert }),

        // Vehicle Thresholds
        ...(body.pendingVehiclesAlert !== undefined && { pendingVehiclesAlert: body.pendingVehiclesAlert }),
        ...(body.changesRequestedAlert !== undefined && { changesRequestedAlert: body.changesRequestedAlert }),

        // Booking Thresholds
        ...(body.highCancellationThreshold !== undefined && { highCancellationThreshold: body.highCancellationThreshold }),
        ...(body.bookingsStartingTodayAlert !== undefined && { bookingsStartingTodayAlert: body.bookingsStartingTodayAlert }),

        // Document Thresholds
        ...(body.documentExpiryWarningDays !== undefined && { documentExpiryWarningDays: body.documentExpiryWarningDays }),
        ...(body.documentExpiryUrgentDays !== undefined && { documentExpiryUrgentDays: body.documentExpiryUrgentDays }),
        ...(body.expiredDocumentsAlert !== undefined && { expiredDocumentsAlert: body.expiredDocumentsAlert }),
        ...(body.pendingDocumentsAlert !== undefined && { pendingDocumentsAlert: body.pendingDocumentsAlert }),

        // Financial Thresholds
        ...(body.negativeBalanceAlert !== undefined && { negativeBalanceAlert: body.negativeBalanceAlert }),
        ...(body.failedPayoutsAlert !== undefined && { failedPayoutsAlert: body.failedPayoutsAlert }),
        ...(body.pendingRefundThreshold !== undefined && { pendingRefundThreshold: body.pendingRefundThreshold }),
        ...(body.pendingRefundsAlert !== undefined && { pendingRefundsAlert: body.pendingRefundsAlert }),

        // Claim Thresholds
        ...(body.openClaimsAlert !== undefined && { openClaimsAlert: body.openClaimsAlert }),

        // Review Thresholds
        ...(body.lowRatingThreshold !== undefined && { lowRatingThreshold: body.lowRatingThreshold }),
        ...(body.lowRatingsAlert !== undefined && { lowRatingsAlert: body.lowRatingsAlert }),

        // Security Thresholds
        ...(body.securityEventsAlert !== undefined && { securityEventsAlert: body.securityEventsAlert }),
        ...(body.criticalSecurityThreshold !== undefined && { criticalSecurityThreshold: body.criticalSecurityThreshold }),

        // Performance Thresholds
        ...(body.slowResponseThreshold !== undefined && { slowResponseThreshold: body.slowResponseThreshold }),
        ...(body.criticalResponseThreshold !== undefined && { criticalResponseThreshold: body.criticalResponseThreshold })
      },
      create: {
        id: 'global',
        ...body
      }
    })

    console.log('[Fleet Alert Settings] Updated:', {
      alertEmailsEnabled: settings.alertEmailsEnabled,
      recipientCount: settings.alertEmailRecipients.length,
      digestFrequency: settings.emailDigestFrequency
    })

    return NextResponse.json({
      success: true,
      message: 'Alert settings updated successfully',
      settings
    })

  } catch (error) {
    console.error('[Fleet Alert Settings] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
