// app/lib/notifications/booking-bell.ts
// Helper to create and query BookingNotification records for the in-app bell

import { prisma } from '@/app/lib/database/prisma'

// ─── Types ─────────────────────────────────────────────────────────

export type BellNotificationType =
  | 'BOOKING_RECEIVED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_ON_HOLD'
  | 'BOOKING_HOLD_RELEASED'
  | 'TRIP_STARTED'
  | 'TRIP_ENDED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_NO_SHOW'
  | 'BOOKING_AUTO_COMPLETED'
  | 'DEPOSIT_RELEASED'
  | 'PICKUP_REMINDER'
  | 'RETURN_REMINDER'

export type BellPriority = 'HIGH' | 'MEDIUM' | 'LOW'

interface CreateBellNotificationData {
  bookingId: string
  recipientType: 'GUEST' | 'HOST'
  recipientId: string   // reviewerProfileId or hostId
  userId?: string | null // User.id for guest auth lookup
  type: BellNotificationType
  title: string
  message: string
  actionUrl?: string
  priority?: BellPriority
}

// ─── Create Notification ───────────────────────────────────────────

export async function createBookingNotification(data: CreateBellNotificationData): Promise<void> {
  try {
    await prisma.bookingNotification.create({
      data: {
        bookingId: data.bookingId,
        recipientType: data.recipientType,
        recipientId: data.recipientId,
        userId: data.userId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl || null,
        priority: data.priority || 'MEDIUM',
      },
    })
  } catch (error) {
    console.error('[Bell] Failed to create notification:', error)
  }
}

// ─── Create Guest + Host Pair ──────────────────────────────────────

interface BellPairData {
  bookingId: string
  guestId?: string | null     // reviewerProfileId
  userId?: string | null      // User.id
  hostId: string
  type: BellNotificationType
  guestTitle: string
  guestMessage: string
  hostTitle: string
  hostMessage: string
  guestActionUrl?: string
  hostActionUrl?: string
  priority?: BellPriority
}

export async function createBookingNotificationPair(data: BellPairData): Promise<void> {
  const promises: Promise<void>[] = []

  // Guest notification
  if (data.guestId) {
    promises.push(createBookingNotification({
      bookingId: data.bookingId,
      recipientType: 'GUEST',
      recipientId: data.guestId,
      userId: data.userId,
      type: data.type,
      title: data.guestTitle,
      message: data.guestMessage,
      actionUrl: data.guestActionUrl,
      priority: data.priority,
    }))
  }

  // Host notification
  promises.push(createBookingNotification({
    bookingId: data.bookingId,
    recipientType: 'HOST',
    recipientId: data.hostId,
    type: data.type,
    title: data.hostTitle,
    message: data.hostMessage,
    actionUrl: data.hostActionUrl,
    priority: data.priority,
  }))

  await Promise.allSettled(promises)
}

// ─── Query Functions ───────────────────────────────────────────────

export async function getGuestBellNotifications(userId: string, limit = 20) {
  return prisma.bookingNotification.findMany({
    where: {
      userId,
      dismissedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getGuestUnreadCount(userId: string): Promise<number> {
  return prisma.bookingNotification.count({
    where: {
      userId,
      readAt: null,
      dismissedAt: null,
    },
  })
}

export async function getHostBellNotifications(hostId: string, limit = 20) {
  return prisma.bookingNotification.findMany({
    where: {
      recipientId: hostId,
      recipientType: 'HOST',
      dismissedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getHostUnreadCount(hostId: string): Promise<number> {
  return prisma.bookingNotification.count({
    where: {
      recipientId: hostId,
      recipientType: 'HOST',
      readAt: null,
      dismissedAt: null,
    },
  })
}

// ─── Mark Read / Dismiss ───────────────────────────────────────────

export async function markBellNotificationRead(notificationId: string): Promise<void> {
  await prisma.bookingNotification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  })
}

export async function dismissBellNotification(notificationId: string): Promise<void> {
  await prisma.bookingNotification.update({
    where: { id: notificationId },
    data: { dismissedAt: new Date(), readAt: new Date() },
  })
}

export async function markAllRead(userId: string, recipientType: 'GUEST' | 'HOST'): Promise<number> {
  const where = recipientType === 'GUEST'
    ? { userId, readAt: null, dismissedAt: null }
    : { recipientId: userId, recipientType: 'HOST', readAt: null as Date | null, dismissedAt: null as Date | null }

  const result = await prisma.bookingNotification.updateMany({
    where,
    data: { readAt: new Date() },
  })
  return result.count
}
