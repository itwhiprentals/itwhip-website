// app/api/fleet/partners/[id]/activity/route.ts
// GET /api/fleet/partners/[id]/activity - Get partner activity timeline

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verify partner exists
    const partner = await prisma.rentalHost.findUnique({
      where: { id },
      select: { id: true, partnerCompanyName: true }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Fetch activity from multiple sources in parallel
    const [
      commissionChanges,
      documentEvents,
      payoutEvents,
      bookingEvents,
      vehicleActivity
    ] = await Promise.all([
      // Commission history
      prisma.partnerCommissionHistory.findMany({
        where: { hostId: id },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

      // Document events
      prisma.partnerDocument.findMany({
        where: { hostId: id },
        orderBy: { uploadedAt: 'desc' },
        take: limit
      }),

      // Payout events
      prisma.partnerPayout.findMany({
        where: { hostId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          netAmount: true,
          grossRevenue: true,
          status: true,
          createdAt: true,
          paidAt: true
        }
      }),

      // Bookings on partner vehicles
      prisma.rentalBooking.findMany({
        where: { car: { hostId: id } },
        select: {
          id: true,
          status: true,
          createdAt: true,
          totalAmount: true,
          car: {
            select: {
              make: true,
              model: true,
              year: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

      // Vehicle activity logs
      prisma.activityLog.findMany({
        where: { hostId: id },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ])

    // Normalize and merge into unified timeline
    const timeline: Array<{
      id: string
      type: string
      title: string
      description?: string
      timestamp: Date
      severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
      metadata?: Record<string, any>
    }> = []

    // Commission changes
    commissionChanges.forEach(c => {
      timeline.push({
        id: `commission-${c.id}`,
        type: 'COMMISSION',
        title: `Commission rate changed`,
        description: `${(c.oldRate * 100).toFixed(0)}% → ${(c.newRate * 100).toFixed(0)}%${c.reason ? ` - ${c.reason}` : ''}`,
        timestamp: c.createdAt,
        severity: 'INFO',
        metadata: {
          oldRate: c.oldRate,
          newRate: c.newRate,
          changedBy: c.changedBy
        }
      })
    })

    // Document events
    documentEvents.forEach(d => {
      const statusMap: Record<string, { title: string; severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' }> = {
        'APPROVED': { title: 'Document approved', severity: 'SUCCESS' },
        'REJECTED': { title: 'Document rejected', severity: 'ERROR' },
        'PENDING_REVIEW': { title: 'Document uploaded', severity: 'INFO' },
        'EXPIRED': { title: 'Document expired', severity: 'WARNING' }
      }
      const info = statusMap[d.status] || { title: `Document ${d.status.toLowerCase()}`, severity: 'INFO' as const }

      timeline.push({
        id: `doc-${d.id}`,
        type: 'DOCUMENT',
        title: info.title,
        description: `${d.type.replace(/_/g, ' ')}${d.rejectNote ? ` - ${d.rejectNote}` : ''}`,
        timestamp: d.uploadedAt,
        severity: d.isExpired ? 'WARNING' : info.severity,
        metadata: {
          documentType: d.type,
          status: d.status,
          expiresAt: d.expiresAt
        }
      })
    })

    // Payout events
    payoutEvents.forEach(p => {
      const statusMap: Record<string, { title: string; severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' }> = {
        'COMPLETED': { title: 'Payout completed', severity: 'SUCCESS' },
        'PENDING': { title: 'Payout initiated', severity: 'INFO' },
        'FAILED': { title: 'Payout failed', severity: 'ERROR' },
        'CANCELLED': { title: 'Payout cancelled', severity: 'WARNING' }
      }
      const info = statusMap[p.status] || { title: `Payout ${p.status.toLowerCase()}`, severity: 'INFO' as const }

      timeline.push({
        id: `payout-${p.id}`,
        type: 'PAYOUT',
        title: info.title,
        description: `$${(p.netAmount || 0).toFixed(2)} (gross: $${(p.grossRevenue || 0).toFixed(2)})`,
        timestamp: p.paidAt || p.createdAt,
        severity: info.severity,
        metadata: {
          netAmount: p.netAmount,
          grossRevenue: p.grossRevenue,
          status: p.status
        }
      })
    })

    // Booking events
    bookingEvents.forEach(b => {
      const statusMap: Record<string, { title: string; severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' }> = {
        'CONFIRMED': { title: 'Booking confirmed', severity: 'SUCCESS' },
        'PENDING': { title: 'New booking request', severity: 'INFO' },
        'COMPLETED': { title: 'Booking completed', severity: 'SUCCESS' },
        'CANCELLED': { title: 'Booking cancelled', severity: 'WARNING' },
        'DECLINED': { title: 'Booking declined', severity: 'ERROR' }
      }
      const info = statusMap[b.status] || { title: `Booking ${b.status.toLowerCase()}`, severity: 'INFO' as const }
      const carName = b.car ? `${b.car.year} ${b.car.make} ${b.car.model}` : 'Vehicle'

      timeline.push({
        id: `booking-${b.id}`,
        type: 'BOOKING',
        title: info.title,
        description: `${carName} - $${(b.totalAmount || 0).toFixed(2)}`,
        timestamp: b.createdAt,
        severity: info.severity,
        metadata: {
          bookingId: b.id,
          totalAmount: b.totalAmount,
          status: b.status
        }
      })
    })

    // Vehicle activity logs
    vehicleActivity.forEach(a => {
      timeline.push({
        id: `activity-${a.id}`,
        type: a.action || 'ACTIVITY',
        title: a.action?.replace(/_/g, ' ') || 'Activity',
        description: a.details as string || undefined,
        timestamp: a.createdAt,
        severity: 'INFO',
        metadata: {
          entityType: a.entityType,
          entityId: a.entityId
        }
      })
    })

    // Sort by timestamp descending
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      activities: timeline.slice(0, limit),
      counts: {
        commission: commissionChanges.length,
        documents: documentEvents.length,
        payouts: payoutEvents.length,
        bookings: bookingEvents.length,
        activity: vehicleActivity.length
      }
    })

  } catch (error: any) {
    console.error('[Partner Activity API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner activity' },
      { status: 500 }
    )
  }
}
