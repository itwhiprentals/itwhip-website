// app/api/partner/notifications/route.ts
// Partner Notifications API - Aggregated activity feed

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

interface Notification {
  id: string
  type: 'booking' | 'review' | 'message' | 'maintenance' | 'claim' | 'payout'
  title: string
  description: string
  timestamp: string
  isRead: boolean
  link?: string
  metadata?: Record<string, any>
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // filter by type

    // Get partner's vehicle IDs
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true, make: true, model: true, year: true, currentMileage: true }
    })
    const vehicleIds = vehicles.map(v => v.id)
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]))

    const notifications: Notification[] = []
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 1. Recent Bookings (last 30 days)
    if (!type || type === 'booking') {
      const bookings = await prisma.rentalBooking.findMany({
        where: {
          carId: { in: vehicleIds },
          createdAt: { gte: thirtyDaysAgo }
        },
        include: {
          rentalCar: {
            select: { make: true, model: true, year: true }
          },
          user: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      bookings.forEach(booking => {
        const guestName = booking.user
          ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()
          : booking.guestName || 'Guest'
        const vehicleName = booking.rentalCar
          ? `${booking.rentalCar.year} ${booking.rentalCar.make} ${booking.rentalCar.model}`
          : 'Vehicle'

        let title = ''
        let description = ''

        switch (booking.status) {
          case 'CONFIRMED':
            title = 'New Booking Confirmed'
            description = `${guestName} booked ${vehicleName}`
            break
          case 'IN_PROGRESS':
            title = 'Trip Started'
            description = `${guestName} picked up ${vehicleName}`
            break
          case 'COMPLETED':
            title = 'Trip Completed'
            description = `${guestName} returned ${vehicleName}`
            break
          case 'CANCELLED':
            title = 'Booking Cancelled'
            description = `${guestName} cancelled booking for ${vehicleName}`
            break
          default:
            title = 'Booking Update'
            description = `Booking status: ${booking.status}`
        }

        notifications.push({
          id: `booking_${booking.id}`,
          type: 'booking',
          title,
          description,
          timestamp: booking.updatedAt.toISOString(),
          isRead: true, // Bookings are informational
          link: `/partner/bookings?id=${booking.id}`,
          metadata: {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            status: booking.status
          }
        })
      })
    }

    // 2. Reviews (all time, unresponded are unread)
    if (!type || type === 'review') {
      const reviews = await prisma.rentalReview.findMany({
        where: {
          booking: {
            carId: { in: vehicleIds }
          }
        },
        include: {
          booking: {
            include: {
              rentalCar: {
                select: { make: true, model: true, year: true }
              },
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      reviews.forEach(review => {
        const guestName = review.booking?.user
          ? `${review.booking.user.firstName || ''} ${review.booking.user.lastName || ''}`.trim()
          : 'Guest'
        const vehicleName = review.booking?.rentalCar
          ? `${review.booking.rentalCar.year} ${review.booking.rentalCar.make} ${review.booking.rentalCar.model}`
          : 'Vehicle'

        notifications.push({
          id: `review_${review.id}`,
          type: 'review',
          title: `New ${review.rating}-Star Review`,
          description: `${guestName} left a review for ${vehicleName}`,
          timestamp: review.createdAt.toISOString(),
          isRead: !!review.hostResponse, // Unread if no response
          link: `/partner/reviews?id=${review.id}`,
          metadata: {
            reviewId: review.id,
            rating: review.rating,
            hasResponse: !!review.hostResponse
          }
        })
      })
    }

    // 3. Unread Messages
    if (!type || type === 'message') {
      const bookingIds = await prisma.rentalBooking.findMany({
        where: { carId: { in: vehicleIds } },
        select: { id: true }
      }).then(b => b.map(x => x.id))

      const unreadMessages = await prisma.rentalMessage.findMany({
        where: {
          bookingId: { in: bookingIds },
          senderType: 'guest',
          isRead: false
        },
        include: {
          booking: {
            include: {
              rentalCar: {
                select: { make: true, model: true, year: true }
              },
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      unreadMessages.forEach(msg => {
        const guestName = msg.booking?.user
          ? `${msg.booking.user.firstName || ''} ${msg.booking.user.lastName || ''}`.trim()
          : msg.senderName || 'Guest'

        notifications.push({
          id: `message_${msg.id}`,
          type: 'message',
          title: 'New Message',
          description: `${guestName}: ${msg.message.substring(0, 80)}${msg.message.length > 80 ? '...' : ''}`,
          timestamp: msg.createdAt.toISOString(),
          isRead: false,
          link: `/partner/messages?booking=${msg.bookingId}`,
          metadata: {
            messageId: msg.id,
            bookingId: msg.bookingId,
            isUrgent: msg.isUrgent
          }
        })
      })
    }

    // 4. Maintenance Due
    if (!type || type === 'maintenance') {
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const maintenanceRecords = await prisma.vehicleServiceRecord.findMany({
        where: {
          carId: { in: vehicleIds },
          OR: [
            { nextServiceDue: { lte: thirtyDaysFromNow } },
            // We can't easily query mileage-based in Prisma, so we'll filter later
          ]
        },
        include: {
          car: {
            select: { id: true, make: true, model: true, year: true, currentMileage: true }
          }
        },
        orderBy: { nextServiceDue: 'asc' },
        take: 20
      })

      maintenanceRecords.forEach(record => {
        const car = record.car
        if (!car) return

        const vehicleName = `${car.year} ${car.make} ${car.model}`
        const currentMileage = car.currentMileage || 0

        let isOverdue = false
        let isDueSoon = false

        if (record.nextServiceDue) {
          if (new Date(record.nextServiceDue) < now) {
            isOverdue = true
          } else if (new Date(record.nextServiceDue) < thirtyDaysFromNow) {
            isDueSoon = true
          }
        }

        if (record.nextServiceMileage && currentMileage >= record.nextServiceMileage) {
          isOverdue = true
        } else if (record.nextServiceMileage && currentMileage >= record.nextServiceMileage - 500) {
          isDueSoon = true
        }

        if (isOverdue || isDueSoon) {
          notifications.push({
            id: `maintenance_${record.id}`,
            type: 'maintenance',
            title: isOverdue ? 'Maintenance Overdue' : 'Maintenance Due Soon',
            description: `${record.serviceType} for ${vehicleName}`,
            timestamp: record.nextServiceDue?.toISOString() || record.updatedAt.toISOString(),
            isRead: false, // Maintenance alerts are always unread until addressed
            link: `/partner/maintenance?vehicle=${car.id}`,
            metadata: {
              recordId: record.id,
              serviceType: record.serviceType,
              vehicleId: car.id,
              isOverdue,
              isDueSoon
            }
          })
        }
      })
    }

    // 5. Claim Updates
    if (!type || type === 'claim') {
      const claims = await prisma.claim.findMany({
        where: {
          hostId: partner.id,
          updatedAt: { gte: thirtyDaysAgo }
        },
        include: {
          booking: {
            include: {
              rentalCar: {
                select: { make: true, model: true, year: true }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 20
      })

      claims.forEach(claim => {
        const vehicleName = claim.booking?.rentalCar
          ? `${claim.booking.rentalCar.year} ${claim.booking.rentalCar.make} ${claim.booking.rentalCar.model}`
          : 'Vehicle'

        let title = 'Claim Update'
        switch (claim.status) {
          case 'PENDING':
            title = 'Claim Submitted'
            break
          case 'UNDER_REVIEW':
            title = 'Claim Under Review'
            break
          case 'APPROVED':
            title = 'Claim Approved'
            break
          case 'PAID':
            title = 'Claim Paid'
            break
          case 'DENIED':
            title = 'Claim Denied'
            break
          case 'DISPUTED':
            title = 'Claim Disputed'
            break
        }

        notifications.push({
          id: `claim_${claim.id}`,
          type: 'claim',
          title,
          description: `${claim.type} claim for ${vehicleName}`,
          timestamp: claim.updatedAt.toISOString(),
          isRead: claim.status === 'PAID' || claim.status === 'DENIED',
          link: `/partner/claims?id=${claim.id}`,
          metadata: {
            claimId: claim.id,
            status: claim.status,
            type: claim.type
          }
        })
      })
    }

    // 6. Payouts
    if (!type || type === 'payout') {
      const payouts = await prisma.hostPayout.findMany({
        where: {
          hostId: partner.id,
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      payouts.forEach(payout => {
        notifications.push({
          id: `payout_${payout.id}`,
          type: 'payout',
          title: payout.status === 'COMPLETED' ? 'Payout Sent' : `Payout ${payout.status}`,
          description: `$${Number(payout.amount).toFixed(2)} ${payout.status.toLowerCase()}`,
          timestamp: payout.createdAt.toISOString(),
          isRead: true,
          link: `/partner/revenue`,
          metadata: {
            payoutId: payout.id,
            amount: Number(payout.amount),
            status: payout.status
          }
        })
      })
    }

    // Sort all notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit results
    const limitedNotifications = notifications.slice(0, limit)

    // Calculate counts
    const counts = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      booking: notifications.filter(n => n.type === 'booking').length,
      review: notifications.filter(n => n.type === 'review').length,
      message: notifications.filter(n => n.type === 'message').length,
      maintenance: notifications.filter(n => n.type === 'maintenance').length,
      claim: notifications.filter(n => n.type === 'claim').length,
      payout: notifications.filter(n => n.type === 'payout').length
    }

    return NextResponse.json({
      success: true,
      notifications: limitedNotifications,
      counts
    })

  } catch (error) {
    console.error('[Partner Notifications] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
