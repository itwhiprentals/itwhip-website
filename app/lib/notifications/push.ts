// app/lib/notifications/push.ts
// Push notification service — sends via Expo SDK + saves to PushNotification model

import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk'
import { prisma } from '@/app/lib/database/prisma'

const expo = new Expo()

export type PushNotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'message'
  | 'payment'
  | 'trip_reminder'
  | 'review_request'
  | 'host_reminder'

interface PushPayload {
  userId: string
  title: string
  body: string
  type: PushNotificationType
  data?: Record<string, string>
}

export async function sendPushNotification(payload: PushPayload): Promise<void> {
  const { userId, title, body, type, data } = payload

  try {
    // 1. Save to in-app notification center
    await prisma.pushNotification.create({
      data: { userId, title, body, type, data: data || {}, read: false },
    })

    // 2. Find active push tokens
    const tokens = await prisma.devicePushToken.findMany({
      where: { userId, active: true },
      select: { token: true },
    })

    if (tokens.length === 0) return

    // 3. Build Expo messages
    const messages: ExpoPushMessage[] = []
    const unreadCount = await getUnreadCount(userId)

    for (const { token } of tokens) {
      if (!Expo.isExpoPushToken(token)) continue
      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
        data: { type, ...data },
        badge: unreadCount,
      })
    }

    if (messages.length === 0) return

    // 4. Send in chunks
    const chunks = expo.chunkPushNotifications(messages)
    for (const chunk of chunks) {
      try {
        const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk)
        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i]
          if (ticket.status === 'error' && ticket.details?.error) {
            if (['DeviceNotRegistered', 'InvalidCredentials'].includes(ticket.details.error)) {
              const failedToken = (chunk[i] as ExpoPushMessage).to as string
              await prisma.devicePushToken.updateMany({
                where: { token: failedToken },
                data: { active: false },
              })
            }
          }
        }
      } catch (error) {
        console.error('[Push] Error sending chunk:', error)
      }
    }
  } catch (error) {
    console.error(`[Push] Failed for user ${userId}:`, error)
  }
}

export async function sendBulkPush(userIds: string[], title: string, body: string, type: PushNotificationType, data?: Record<string, string>): Promise<void> {
  await Promise.allSettled(userIds.map(userId => sendPushNotification({ userId, title, body, type, data })))
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.pushNotification.count({ where: { userId, read: false } })
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await prisma.pushNotification.update({ where: { id, userId }, data: { read: true } })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.pushNotification.updateMany({ where: { userId, read: false }, data: { read: true } })
}

// ─── Pre-built Templates ─────────────────────────────────────────

export const NotificationTemplates = {
  bookingRequest: (hostUserId: string, guestName: string, carName: string, bookingId: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'New Booking Request',
      body: `${guestName} wants to rent your ${carName}`,
      type: 'booking_request',
      data: { bookingId, screen: 'booking-detail' },
    }),

  bookingConfirmed: (guestUserId: string, carName: string, bookingId: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'Booking Confirmed!',
      body: `Your ${carName} rental is confirmed. Get ready for your trip!`,
      type: 'booking_confirmed',
      data: { bookingId, screen: 'booking-detail' },
    }),

  bookingCancelled: (userId: string, carName: string, bookingId: string, cancelledBy: string) =>
    sendPushNotification({
      userId,
      title: 'Booking Cancelled',
      body: `The ${carName} rental was cancelled by the ${cancelledBy}.`,
      type: 'booking_cancelled',
      data: { bookingId, screen: 'booking-detail' },
    }),

  newMessage: (recipientUserId: string, senderName: string, preview: string, threadId: string) =>
    sendPushNotification({
      userId: recipientUserId,
      title: `Message from ${senderName}`,
      body: preview.length > 80 ? preview.slice(0, 77) + '...' : preview,
      type: 'message',
      data: { threadId, screen: 'messages' },
    }),

  paymentReceived: (hostUserId: string, amount: string, bookingId: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Payment Received',
      body: `You earned $${amount} from a completed trip`,
      type: 'payment',
      data: { bookingId, screen: 'revenue' },
    }),

  tripStartingSoon: (guestUserId: string, carName: string, bookingId: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'Trip Starts in 1 Hour',
      body: `Your ${carName} pickup is in 1 hour. Don't forget your ID!`,
      type: 'trip_reminder',
      data: { bookingId, screen: 'booking-detail' },
    }),

  tripEndingSoon: (guestUserId: string, carName: string, bookingId: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'Trip Ends in 1 Hour',
      body: `Your ${carName} rental ends in 1 hour. Please return on time.`,
      type: 'trip_reminder',
      data: { bookingId, screen: 'booking-detail' },
    }),

  reviewRequest: (guestUserId: string, carName: string, bookingId: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'How Was Your Trip?',
      body: `Rate your ${carName} rental experience`,
      type: 'review_request',
      data: { bookingId, screen: 'reviews' },
    }),

  hostAcceptanceReminder: (hostUserId: string, guestName: string, bookingId: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Booking Waiting for You',
      body: `${guestName}'s booking request is still pending. Respond soon!`,
      type: 'host_reminder',
      data: { bookingId, screen: 'booking-detail' },
    }),
}
