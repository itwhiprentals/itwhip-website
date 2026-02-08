// app/api/fleet/notifications/route.ts
// Fleet Notifications API - Aggregated alerts for fleet admins

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

interface Notification {
  id: string
  type: string
  category: 'partner' | 'vehicle' | 'booking' | 'document' | 'financial' | 'claim' | 'review' | 'security'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  link?: string
  metadata?: Record<string, any>
  timestamp: string
}

export async function GET(request: NextRequest) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch dynamic alert settings
    let alertSettings = await prisma.fleet_alert_settings.findUnique({
      where: { id: 'global' }
    })

    // Create default settings if not exists
    if (!alertSettings) {
      alertSettings = await prisma.fleet_alert_settings.create({
        data: { id: 'global' }
      })
    }

    const notifications: Notification[] = []
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    // Use dynamic document expiry warning days from settings
    const documentWarningDate = new Date(now.getTime() + alertSettings.documentExpiryWarningDays * 24 * 60 * 60 * 1000)

    // 1. PARTNER ALERTS
    if (category === 'all' || category === 'partner') {
      // Pending partner applications
      const pendingApplications = await prisma.rentalHost.findMany({
        where: {
          approvalStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
          hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
        },
        select: {
          id: true,
          partnerCompanyName: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      pendingApplications.forEach(app => {
        notifications.push({
          id: `partner_app_${app.id}`,
          type: 'PARTNER_APPLICATION',
          category: 'partner',
          priority: 'high',
          title: 'New Partner Application',
          description: `${app.partnerCompanyName || 'Unknown Company'} has submitted a partner application`,
          link: `/fleet/partners/applications`,
          metadata: { partnerId: app.id },
          timestamp: app.createdAt.toISOString()
        })
      })

      // Suspended partners
      const suspendedPartners = await prisma.rentalHost.count({
        where: {
          active: false,
          hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
          approvalStatus: 'APPROVED'
        }
      })

      if (suspendedPartners > 0) {
        notifications.push({
          id: 'partner_suspended_count',
          type: 'PARTNERS_SUSPENDED',
          category: 'partner',
          priority: 'medium',
          title: 'Suspended Partners',
          description: `${suspendedPartners} partner(s) are currently suspended`,
          link: `/fleet/partners?filter=suspended`,
          timestamp: now.toISOString()
        })
      }
    }

    // 2. VEHICLE ALERTS
    if (category === 'all' || category === 'vehicle') {
      // Vehicles pending approval (inactive vehicles from fleet partners)
      const pendingVehicles = await prisma.rentalCar.findMany({
        where: {
          isActive: false,
          host: {
            hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
          }
        },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          createdAt: true,
          host: {
            select: { partnerCompanyName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      pendingVehicles.forEach(v => {
        notifications.push({
          id: `vehicle_pending_${v.id}`,
          type: 'VEHICLE_PENDING_APPROVAL',
          category: 'vehicle',
          priority: 'high',
          title: 'Vehicle Pending Approval',
          description: `${v.year} ${v.make} ${v.model} from ${v.host?.partnerCompanyName || 'Unknown Partner'}`,
          link: `/fleet/vehicles/${v.id}`,
          metadata: { vehicleId: v.id },
          timestamp: v.createdAt.toISOString()
        })
      })

      // Vehicles requiring inspection (safety holds / inspection needed)
      const changesRequested = await prisma.rentalCar.count({
        where: {
          OR: [
            { requiresInspection: true },
            { safetyHold: true }
          ],
          host: {
            hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
          }
        }
      })

      if (changesRequested > 0) {
        notifications.push({
          id: 'vehicle_changes_requested',
          type: 'VEHICLES_CHANGES_REQUESTED',
          category: 'vehicle',
          priority: 'medium',
          title: 'Vehicles Awaiting Changes',
          description: `${changesRequested} vehicle(s) have requested changes pending`,
          link: `/fleet/vehicles?approvalStatus=CHANGES_REQUESTED`,
          timestamp: now.toISOString()
        })
      }
    }

    // 3. BOOKING ALERTS
    if (category === 'all' || category === 'booking') {
      // New bookings in last 24 hours
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const newBookings = await prisma.rentalBooking.count({
        where: {
          createdAt: { gte: yesterday },
          car: {
            host: {
              hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
            }
          }
        }
      })

      if (newBookings > 0) {
        notifications.push({
          id: 'bookings_new_24h',
          type: 'NEW_BOOKINGS',
          category: 'booking',
          priority: 'low',
          title: 'New Bookings',
          description: `${newBookings} new booking(s) in the last 24 hours`,
          link: `/fleet/bookings?sortBy=createdAt&sortOrder=desc`,
          timestamp: now.toISOString()
        })
      }

      // Bookings starting today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
      const startingToday = await prisma.rentalBooking.count({
        where: {
          startDate: { gte: todayStart, lt: todayEnd },
          status: 'CONFIRMED',
          car: {
            host: {
              hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
            }
          }
        }
      })

      if (startingToday > 0) {
        notifications.push({
          id: 'bookings_starting_today',
          type: 'BOOKINGS_STARTING',
          category: 'booking',
          priority: 'medium',
          title: 'Bookings Starting Today',
          description: `${startingToday} booking(s) starting today`,
          link: `/fleet/bookings?status=CONFIRMED`,
          timestamp: now.toISOString()
        })
      }

      // Cancelled bookings in last 7 days
      const cancelledRecent = await prisma.rentalBooking.count({
        where: {
          status: 'CANCELLED',
          updatedAt: { gte: sevenDaysAgo },
          car: {
            host: {
              hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
            }
          }
        }
      })

      // Use dynamic cancellation threshold from settings
      if (cancelledRecent >= alertSettings.highCancellationThreshold) {
        notifications.push({
          id: 'bookings_cancelled_week',
          type: 'HIGH_CANCELLATIONS',
          category: 'booking',
          priority: 'medium',
          title: 'High Cancellation Rate',
          description: `${cancelledRecent} booking(s) cancelled in the last 7 days (threshold: ${alertSettings.highCancellationThreshold})`,
          link: `/fleet/bookings?status=CANCELLED`,
          timestamp: now.toISOString()
        })
      }
    }

    // 4. DOCUMENT ALERTS
    if (category === 'all' || category === 'document') {
      // Documents expiring soon (using dynamic threshold)
      const expiringDocs = await prisma.partner_documents.findMany({
        where: {
          status: 'VERIFIED',
          expiresAt: { gte: now, lte: documentWarningDate },
          host: {
            hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
          }
        },
        select: {
          id: true,
          type: true,
          expiresAt: true,
          host: {
            select: { id: true, partnerCompanyName: true }
          }
        },
        orderBy: { expiresAt: 'asc' },
        take: 10
      })

      expiringDocs.forEach(doc => {
        const daysUntil = Math.ceil((doc.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        // Use dynamic urgent threshold from settings
        const isUrgent = daysUntil <= alertSettings.documentExpiryUrgentDays
        notifications.push({
          id: `doc_expiring_${doc.id}`,
          type: 'DOCUMENT_EXPIRING',
          category: 'document',
          priority: isUrgent ? 'high' : 'medium',
          title: 'Document Expiring Soon',
          description: `${doc.type} for ${doc.host?.partnerCompanyName} expires in ${daysUntil} day(s)`,
          link: `/fleet/partners/${doc.host?.id}/documents`,
          metadata: { partnerId: doc.host?.id, documentId: doc.id, daysUntil },
          timestamp: now.toISOString()
        })
      })

      // Expired documents
      const expiredDocs = await prisma.partner_documents.count({
        where: {
          status: 'EXPIRED',
          host: {
            hostType: { in: ['FLEET_PARTNER', 'PARTNER'] },
            active: true
          }
        }
      })

      if (expiredDocs > 0) {
        notifications.push({
          id: 'docs_expired_count',
          type: 'DOCUMENTS_EXPIRED',
          category: 'document',
          priority: 'high',
          title: 'Expired Documents',
          description: `${expiredDocs} document(s) have expired for active partners`,
          link: `/fleet/partners?documentsExpired=true`,
          timestamp: now.toISOString()
        })
      }

      // Documents pending review
      const pendingDocs = await prisma.partner_documents.count({
        where: {
          status: 'PENDING',
          host: {
            hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
          }
        }
      })

      if (pendingDocs > 0) {
        notifications.push({
          id: 'docs_pending_review',
          type: 'DOCUMENTS_PENDING',
          category: 'document',
          priority: 'medium',
          title: 'Documents Pending Review',
          description: `${pendingDocs} document(s) awaiting verification`,
          link: `/fleet/partners`,
          timestamp: now.toISOString()
        })
      }
    }

    // 5. FINANCIAL ALERTS
    if (category === 'all' || category === 'financial') {
      // Partners with negative balance
      const negativeBalancePartners = await prisma.rentalHost.count({
        where: {
          negativeBalance: { gt: 0 },
          hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
        }
      })

      if (negativeBalancePartners > 0) {
        notifications.push({
          id: 'partners_negative_balance',
          type: 'NEGATIVE_BALANCES',
          category: 'financial',
          priority: 'high',
          title: 'Partners with Negative Balance',
          description: `${negativeBalancePartners} partner(s) have negative balances`,
          link: `/fleet/partners?filter=negative_balance`,
          timestamp: now.toISOString()
        })
      }

      // Failed payouts
      const failedPayouts = await prisma.partner_payouts.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: thirtyDaysAgo }
        }
      })

      if (failedPayouts > 0) {
        notifications.push({
          id: 'payouts_failed',
          type: 'FAILED_PAYOUTS',
          category: 'financial',
          priority: 'high',
          title: 'Failed Payouts',
          description: `${failedPayouts} payout(s) failed in the last 30 days`,
          link: `/fleet/partners`,
          timestamp: now.toISOString()
        })
      }

      // Pending refund requests (using dynamic threshold)
      const pendingRefunds = await prisma.refundRequest.count({
        where: {
          status: 'PENDING',
          amount: { gt: alertSettings.pendingRefundThreshold }
        }
      })

      if (pendingRefunds > 0) {
        notifications.push({
          id: 'refunds_pending',
          type: 'REFUNDS_PENDING',
          category: 'financial',
          priority: 'medium',
          title: 'Refund Requests Pending',
          description: `${pendingRefunds} refund(s) over $${alertSettings.pendingRefundThreshold} awaiting approval`,
          link: `/fleet/refunds`,
          timestamp: now.toISOString()
        })
      }
    }

    // 6. CLAIM ALERTS
    if (category === 'all' || category === 'claim') {
      // Open claims
      const openClaims = await prisma.claim.count({
        where: {
          status: { in: ['PENDING', 'UNDER_REVIEW', 'GUEST_RESPONSE_PENDING'] }
        }
      })

      if (openClaims > 0) {
        notifications.push({
          id: 'claims_open',
          type: 'CLAIMS_OPEN',
          category: 'claim',
          priority: 'medium',
          title: 'Open Claims',
          description: `${openClaims} claim(s) require attention`,
          link: `/fleet/claims`,
          timestamp: now.toISOString()
        })
      }
    }

    // 7. REVIEW ALERTS (using dynamic threshold)
    if (category === 'all' || category === 'review') {
      // Low ratings using dynamic threshold
      const lowRatings = await prisma.rentalReview.count({
        where: {
          rating: { lte: alertSettings.lowRatingThreshold },
          createdAt: { gte: sevenDaysAgo },
          booking: {
            car: {
              host: {
                hostType: { in: ['FLEET_PARTNER', 'PARTNER'] }
              }
            }
          }
        }
      })

      if (lowRatings > 0) {
        notifications.push({
          id: 'reviews_low_rating',
          type: 'LOW_RATINGS',
          category: 'review',
          priority: 'medium',
          title: 'Low Ratings Received',
          description: `${lowRatings} rating(s) of ${alertSettings.lowRatingThreshold} stars or less this week`,
          link: `/fleet/partners`,
          timestamp: now.toISOString()
        })
      }
    }

    // 8. SECURITY ALERTS
    if (category === 'all' || category === 'security') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Brute force attacks detected
      const bruteForceEvents = await prisma.securityEvent.findMany({
        where: {
          type: 'BRUTE_FORCE_DETECTED',
          timestamp: { gte: twentyFourHoursAgo }
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      })

      bruteForceEvents.forEach(event => {
        notifications.push({
          id: `security_bruteforce_${event.id}`,
          type: 'BRUTE_FORCE_DETECTED',
          category: 'security',
          priority: 'high',
          title: 'Brute Force Attack Detected',
          description: `${event.message || 'Multiple failed login attempts from IP ' + event.sourceIp}`,
          link: `/fleet/settings?tab=alerts`,
          metadata: { eventId: event.id, sourceIp: event.sourceIp },
          timestamp: event.timestamp.toISOString()
        })
      })

      // Account targeting attacks detected
      const targetedEvents = await prisma.securityEvent.findMany({
        where: {
          type: 'ACCOUNT_TARGETED',
          timestamp: { gte: twentyFourHoursAgo }
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      })

      targetedEvents.forEach(event => {
        notifications.push({
          id: `security_targeted_${event.id}`,
          type: 'ACCOUNT_TARGETED',
          category: 'security',
          priority: 'high',
          title: 'Account Targeted',
          description: `${event.message || 'Multiple failed attempts on account ' + event.targetId}`,
          link: `/fleet/settings?tab=alerts`,
          metadata: { eventId: event.id, targetEmail: event.targetId },
          timestamp: event.timestamp.toISOString()
        })
      })

      // Recent failed logins summary
      const failedLoginsLastHour = await prisma.securityEvent.count({
        where: {
          type: 'LOGIN_FAILED',
          timestamp: { gte: oneHourAgo }
        }
      })

      // Use dynamic threshold from settings
      if (failedLoginsLastHour >= alertSettings.criticalSecurityThreshold) {
        // Get unique IPs for the failed logins
        const uniqueIps = await prisma.securityEvent.findMany({
          where: {
            type: 'LOGIN_FAILED',
            timestamp: { gte: oneHourAgo }
          },
          select: { sourceIp: true },
          distinct: ['sourceIp']
        })

        notifications.push({
          id: 'security_failed_logins_hour',
          type: 'HIGH_FAILED_LOGINS',
          category: 'security',
          priority: 'high',
          title: 'High Failed Login Activity',
          description: `${failedLoginsLastHour} failed login(s) in the last hour from ${uniqueIps.length} unique IP(s) (threshold: ${alertSettings.criticalSecurityThreshold})`,
          link: `/fleet/settings?tab=alerts`,
          metadata: { count: failedLoginsLastHour, uniqueIps: uniqueIps.length },
          timestamp: now.toISOString()
        })
      }

      // Blocked IPs summary
      const blockedAttempts = await prisma.securityEvent.count({
        where: {
          blocked: true,
          timestamp: { gte: twentyFourHoursAgo }
        }
      })

      if (blockedAttempts > 0) {
        notifications.push({
          id: 'security_blocked_24h',
          type: 'BLOCKED_ATTEMPTS',
          category: 'security',
          priority: 'medium',
          title: 'Blocked Login Attempts',
          description: `${blockedAttempts} login attempt(s) blocked in the last 24 hours`,
          link: `/fleet/settings?tab=alerts`,
          metadata: { blockedCount: blockedAttempts },
          timestamp: now.toISOString()
        })
      }
    }

    // Filter by priority if specified
    let filteredNotifications = notifications
    if (priority !== 'all') {
      filteredNotifications = notifications.filter(n => n.priority === priority)
    }

    // Sort by priority (high > medium > low) then by timestamp
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    filteredNotifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

    // Limit results
    filteredNotifications = filteredNotifications.slice(0, limit)

    // Calculate summary counts
    const summary = {
      total: filteredNotifications.length,
      high: filteredNotifications.filter(n => n.priority === 'high').length,
      medium: filteredNotifications.filter(n => n.priority === 'medium').length,
      low: filteredNotifications.filter(n => n.priority === 'low').length,
      byCategory: {
        partner: filteredNotifications.filter(n => n.category === 'partner').length,
        vehicle: filteredNotifications.filter(n => n.category === 'vehicle').length,
        booking: filteredNotifications.filter(n => n.category === 'booking').length,
        document: filteredNotifications.filter(n => n.category === 'document').length,
        financial: filteredNotifications.filter(n => n.category === 'financial').length,
        claim: filteredNotifications.filter(n => n.category === 'claim').length,
        review: filteredNotifications.filter(n => n.category === 'review').length,
        security: filteredNotifications.filter(n => n.category === 'security').length
      }
    }

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      summary
    })

  } catch (error) {
    console.error('[Fleet Notifications] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
