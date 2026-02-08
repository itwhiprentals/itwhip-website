// app/api/fleet/alerts/send/route.ts
// POST /api/fleet/alerts/send - Send alert email digest

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/send-email'
import { generateFleetAlertDigestEmail } from '@/app/lib/email/templates/fleet-alert-digest'

const FLEET_KEY = 'phoenix-fleet-2847'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

interface Notification {
  id: string
  type: string
  category: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  link?: string
}

// Fetch notifications with dynamic thresholds
async function fetchNotificationsWithThresholds(settings: any): Promise<Notification[]> {
  const notifications: Notification[] = []
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Document expiry thresholds from settings
  const documentWarningDate = new Date(now.getTime() + settings.documentExpiryWarningDays * 24 * 60 * 60 * 1000)
  const documentUrgentDays = settings.documentExpiryUrgentDays

  // 1. PARTNER ALERTS
  if (settings.suspendedPartnersAlert) {
    const pendingApplications = await prisma.rentalHost.findMany({
      where: {
        approvalStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
      },
      select: { id: true, partnerCompanyName: true, createdAt: true }
    })

    pendingApplications.forEach(app => {
      const daysPending = Math.floor((now.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const isUrgent = daysPending >= settings.partnerPendingDaysWarning

      notifications.push({
        id: `partner_app_${app.id}`,
        type: 'PARTNER_APPLICATION',
        category: 'partner',
        priority: isUrgent ? 'high' : 'medium',
        title: 'Partner Application Pending',
        description: `${app.partnerCompanyName || 'Unknown'} - ${daysPending} days pending`,
        link: `/fleet/partners/applications`
      })
    })

    const suspendedCount = await prisma.rentalHost.count({
      where: {
        active: false,
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
        approvalStatus: 'APPROVED'
      }
    })

    if (suspendedCount > 0) {
      notifications.push({
        id: 'partner_suspended_count',
        type: 'PARTNERS_SUSPENDED',
        category: 'partner',
        priority: 'medium',
        title: 'Suspended Partners',
        description: `${suspendedCount} partner(s) are suspended`,
        link: `/fleet/partners?filter=suspended`
      })
    }
  }

  // 2. VEHICLE ALERTS
  if (settings.pendingVehiclesAlert) {
    const pendingVehicles = await (prisma.rentalCar.count as any)({
      where: {
        fleetApprovalStatus: 'PENDING',
        host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } }
      }
    })

    if (pendingVehicles > 0) {
      notifications.push({
        id: 'vehicles_pending',
        type: 'VEHICLES_PENDING',
        category: 'vehicle',
        priority: 'high',
        title: 'Vehicles Pending Approval',
        description: `${pendingVehicles} vehicle(s) awaiting approval`,
        link: `/fleet/vehicles?approvalStatus=PENDING`
      })
    }
  }

  if (settings.changesRequestedAlert) {
    const changesRequested = await (prisma.rentalCar.count as any)({
      where: {
        fleetApprovalStatus: 'CHANGES_REQUESTED',
        host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } }
      }
    })

    if (changesRequested > 0) {
      notifications.push({
        id: 'vehicles_changes',
        type: 'VEHICLES_CHANGES',
        category: 'vehicle',
        priority: 'medium',
        title: 'Vehicles Need Changes',
        description: `${changesRequested} vehicle(s) have requested changes`,
        link: `/fleet/vehicles?approvalStatus=CHANGES_REQUESTED`
      })
    }
  }

  // 3. BOOKING ALERTS
  if (settings.bookingsStartingTodayAlert) {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    const startingToday = await (prisma.rentalBooking.count as any)({
      where: {
        startDate: { gte: todayStart, lt: todayEnd },
        status: 'CONFIRMED',
        car: { host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } } }
      }
    })

    if (startingToday > 0) {
      notifications.push({
        id: 'bookings_today',
        type: 'BOOKINGS_TODAY',
        category: 'booking',
        priority: 'medium',
        title: 'Bookings Starting Today',
        description: `${startingToday} booking(s) starting today`,
        link: `/fleet/bookings?status=CONFIRMED`
      })
    }
  }

  // High cancellation check using dynamic threshold
  const cancelledRecent = await (prisma.rentalBooking.count as any)({
    where: {
      status: 'CANCELLED',
      updatedAt: { gte: sevenDaysAgo },
      car: { host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } } }
    }
  })

  if (cancelledRecent >= settings.highCancellationThreshold) {
    notifications.push({
      id: 'high_cancellations',
      type: 'HIGH_CANCELLATIONS',
      category: 'booking',
      priority: 'high',
      title: 'High Cancellation Rate',
      description: `${cancelledRecent} cancellations in 7 days (threshold: ${settings.highCancellationThreshold})`,
      link: `/fleet/bookings?status=CANCELLED`
    })
  }

  // 4. DOCUMENT ALERTS
  if (settings.expiredDocumentsAlert) {
    const expiringDocs = await (prisma.partner_documents.findMany as any)({
      where: {
        status: 'APPROVED',
        expiresAt: { gte: now, lte: documentWarningDate },
        host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } }
      },
      select: {
        id: true,
        type: true,
        expiresAt: true,
        host: { select: { id: true, partnerCompanyName: true } }
      },
      take: 10
    }) as any[]

    expiringDocs.forEach(doc => {
      const daysUntil = Math.ceil((doc.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const isUrgent = daysUntil <= documentUrgentDays

      notifications.push({
        id: `doc_expiring_${doc.id}`,
        type: 'DOCUMENT_EXPIRING',
        category: 'document',
        priority: isUrgent ? 'high' : 'medium',
        title: `Document Expiring in ${daysUntil} day(s)`,
        description: `${doc.type} for ${doc.host?.partnerCompanyName}`,
        link: `/fleet/partners/${doc.host?.id}/documents`
      })
    })

    const expiredCount = await prisma.partner_documents.count({
      where: {
        status: 'EXPIRED',
        host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }, active: true }
      }
    })

    if (expiredCount > 0) {
      notifications.push({
        id: 'docs_expired',
        type: 'DOCUMENTS_EXPIRED',
        category: 'document',
        priority: 'high',
        title: 'Expired Documents',
        description: `${expiredCount} document(s) have expired`,
        link: `/fleet/partners?documentsExpired=true`
      })
    }
  }

  if (settings.pendingDocumentsAlert) {
    const pendingDocs = await (prisma.partner_documents.count as any)({
      where: {
        status: 'PENDING_REVIEW',
        host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } }
      }
    })

    if (pendingDocs > 0) {
      notifications.push({
        id: 'docs_pending',
        type: 'DOCUMENTS_PENDING',
        category: 'document',
        priority: 'medium',
        title: 'Documents Pending Review',
        description: `${pendingDocs} document(s) awaiting verification`,
        link: `/fleet/partners`
      })
    }
  }

  // 5. FINANCIAL ALERTS
  if (settings.negativeBalanceAlert) {
    const negativeBalancePartners = await prisma.rentalHost.count({
      where: {
        negativeBalance: { gt: 0 },
        hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
      }
    })

    if (negativeBalancePartners > 0) {
      notifications.push({
        id: 'negative_balance',
        type: 'NEGATIVE_BALANCE',
        category: 'financial',
        priority: 'high',
        title: 'Negative Balances',
        description: `${negativeBalancePartners} partner(s) have negative balances`,
        link: `/fleet/partners?filter=negative_balance`
      })
    }
  }

  if (settings.failedPayoutsAlert) {
    const failedPayouts = await prisma.partner_payouts.count({
      where: {
        status: 'FAILED',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    if (failedPayouts > 0) {
      notifications.push({
        id: 'failed_payouts',
        type: 'FAILED_PAYOUTS',
        category: 'financial',
        priority: 'high',
        title: 'Failed Payouts',
        description: `${failedPayouts} payout(s) failed in 30 days`,
        link: `/fleet/partners`
      })
    }
  }

  if (settings.pendingRefundsAlert) {
    const pendingRefunds = await prisma.refundRequest.count({
      where: {
        status: 'PENDING',
        amount: { gt: settings.pendingRefundThreshold }
      }
    })

    if (pendingRefunds > 0) {
      notifications.push({
        id: 'pending_refunds',
        type: 'PENDING_REFUNDS',
        category: 'financial',
        priority: 'medium',
        title: 'Refunds Pending Approval',
        description: `${pendingRefunds} refund(s) over $${settings.pendingRefundThreshold}`,
        link: `/fleet/refunds`
      })
    }
  }

  // 6. CLAIM ALERTS
  if (settings.openClaimsAlert) {
    const openClaims = await (prisma.claim.count as any)({
      where: { status: { in: ['SUBMITTED', 'IN_REVIEW', 'PENDING_DOCS'] } }
    })

    if (openClaims > 0) {
      notifications.push({
        id: 'open_claims',
        type: 'OPEN_CLAIMS',
        category: 'claim',
        priority: 'medium',
        title: 'Open Claims',
        description: `${openClaims} claim(s) require attention`,
        link: `/fleet/claims`
      })
    }
  }

  // 7. REVIEW ALERTS (using dynamic threshold)
  if (settings.lowRatingsAlert) {
    const lowRatings = await (prisma.rentalReview.count as any)({
      where: {
        rating: { lte: settings.lowRatingThreshold },
        createdAt: { gte: sevenDaysAgo },
        booking: {
          car: { host: { hostType: { in: ['FLEET_PARTNER', 'PARTNER'] } } }
        }
      }
    })

    if (lowRatings > 0) {
      notifications.push({
        id: 'low_ratings',
        type: 'LOW_RATINGS',
        category: 'review',
        priority: 'medium',
        title: 'Low Ratings Received',
        description: `${lowRatings} rating(s) of ${settings.lowRatingThreshold} stars or less this week`,
        link: `/fleet/partners`
      })
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return notifications
}

export async function POST(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const digestType = body.digestType || 'instant'

    // Get alert settings
    let settings = await prisma.fleet_alert_settings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      settings = await prisma.fleet_alert_settings.create({
        data: { id: 'global' }
      })
    }

    // Check if email alerts are enabled
    if (!settings.alertEmailsEnabled) {
      return NextResponse.json({
        success: false,
        message: 'Email alerts are disabled'
      })
    }

    // Check if there are recipients
    if (settings.alertEmailRecipients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No email recipients configured'
      })
    }

    // Fetch notifications using dynamic thresholds
    const notifications = await fetchNotificationsWithThresholds(settings)

    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No alerts to send',
        alertCount: 0
      })
    }

    // Calculate summary
    const summary = {
      total: notifications.length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    }

    // For instant alerts, only send if there are high priority items
    if (digestType === 'instant' && summary.high === 0) {
      return NextResponse.json({
        success: true,
        message: 'No high priority alerts - skipping instant notification',
        alertCount: summary.total,
        summary
      })
    }

    // Generate email
    const { html, text, subject } = generateFleetAlertDigestEmail({
      alerts: notifications as any,
      summary,
      digestType: digestType as 'instant' | 'hourly' | 'daily' | 'weekly',
      dashboardUrl: BASE_URL
    })

    // Send to all recipients
    const results: any[] = []
    for (const recipient of settings.alertEmailRecipients) {
      const result = await sendEmail({
        to: recipient,
        subject,
        html,
        text
      })
      results.push({ email: recipient, ...result })
    }

    // Log the notification
    await prisma.fleet_alert_history.create({
      data: {
        type: digestType === 'instant' ? 'email' : 'digest',
        recipients: settings.alertEmailRecipients,
        subject,
        alertCount: summary.total,
        highCount: summary.high,
        mediumCount: summary.medium,
        lowCount: summary.low,
        categories: [...new Set(notifications.map(n => n.category))],
        status: results.every(r => r.success) ? 'sent' : 'partial',
        error: results.filter((r: any) => !r.success).map((r: any) => r.error).join('; ') || null
      }
    })

    // Update last sent timestamp
    await prisma.fleet_alert_settings.update({
      where: { id: 'global' },
      data: {
        lastEmailSentAt: digestType === 'instant' ? new Date() : undefined,
        lastDigestSentAt: digestType !== 'instant' ? new Date() : undefined
      }
    })

    console.log('[Fleet Alerts] Email sent:', {
      digestType,
      recipients: settings.alertEmailRecipients.length,
      alertCount: summary.total,
      highPriority: summary.high
    })

    return NextResponse.json({
      success: true,
      message: `Alert email sent to ${settings.alertEmailRecipients.length} recipient(s)`,
      alertCount: summary.total,
      summary,
      results
    })

  } catch (error) {
    console.error('[Fleet Alerts] Send Error:', error)
    return NextResponse.json({ error: 'Failed to send alert email' }, { status: 500 })
  }
}

// GET - Check alert status without sending
export async function GET(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get settings
    let settings = await prisma.fleet_alert_settings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      settings = await prisma.fleet_alert_settings.create({
        data: { id: 'global' }
      })
    }

    // Fetch notifications
    const notifications = await fetchNotificationsWithThresholds(settings)

    const summary = {
      total: notifications.length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    }

    // Get recent history
    const history = await prisma.fleet_alert_history.findMany({
      orderBy: { sentAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      notifications,
      summary,
      settings: {
        alertEmailsEnabled: settings.alertEmailsEnabled,
        recipientCount: settings.alertEmailRecipients.length,
        digestFrequency: settings.emailDigestFrequency,
        lastEmailSentAt: settings.lastEmailSentAt?.toISOString() || null,
        lastDigestSentAt: settings.lastDigestSentAt?.toISOString() || null
      },
      history
    })

  } catch (error) {
    console.error('[Fleet Alerts] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch alert status' }, { status: 500 })
  }
}
