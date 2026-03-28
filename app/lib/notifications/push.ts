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
  | 'fleet_suspended'
  | 'fleet_warned'
  | 'fleet_suspension_lifted'
  | 'fleet_bonus'
  | 'fleet_car_on_hold'
  | 'fleet_car_released'
  | 'fleet_booking_approved'
  | 'fleet_booking_declined'
  | 'fleet_vehicle_assigned'
  | 'fleet_claim_filed'
  | 'fleet_vehicle_update'
  | 'fleet_commission_update'

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

  // ─── Fleet → Guest ──────────────────────────────────────────────

  fleetSuspendedGuest: (guestUserId: string, reason?: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'Account Suspended',
      body: reason ? `Your account has been suspended: ${reason}` : 'Your account has been suspended. Contact support for details.',
      type: 'fleet_suspended',
      data: { screen: 'account' },
    }),

  fleetWarnedGuest: (guestUserId: string, reason: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'Account Warning',
      body: `You've received a warning: ${reason}`,
      type: 'fleet_warned',
      data: { screen: 'account' },
    }),

  fleetLiftedSuspension: (guestUserId: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'Account Reinstated',
      body: 'Your account has been reinstated. You can book again.',
      type: 'fleet_suspension_lifted',
      data: { screen: 'home' },
    }),

  fleetBonusSent: (guestUserId: string, amount: string, fleetName: string) =>
    sendPushNotification({
      userId: guestUserId,
      title: 'You Received a Bonus!',
      body: `You received a $${amount} bonus from ${fleetName}!`,
      type: 'fleet_bonus',
      data: { screen: 'account' },
    }),

  // ─── Fleet → Host ───────────────────────────────────────────────

  fleetCarOnHold: (hostUserId: string, carName: string, reason?: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Vehicle On Hold',
      body: reason ? `Your ${carName} is on hold: ${reason}` : `Your ${carName} is on hold pending verification`,
      type: 'fleet_car_on_hold',
      data: { screen: 'fleet' },
    }),

  fleetCarReleased: (hostUserId: string, carName: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Vehicle Verified',
      body: `Your ${carName} has been verified and is back live`,
      type: 'fleet_car_released',
      data: { screen: 'fleet' },
    }),

  fleetVehicleAssigned: (hostUserId: string, carName: string, fleetName: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Vehicle Assigned',
      body: `You've been assigned ${carName} by ${fleetName}`,
      type: 'fleet_vehicle_assigned',
      data: { screen: 'fleet' },
    }),

  fleetClaimFiled: (hostUserId: string, carName: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Claim Filed',
      body: `A claim was filed on your ${carName}`,
      type: 'fleet_claim_filed',
      data: { screen: 'claims' },
    }),

  fleetVehicleUpdate: (hostUserId: string, carName: string, status: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Vehicle Status Updated',
      body: `Your ${carName} was marked ${status} by fleet`,
      type: 'fleet_vehicle_update',
      data: { screen: 'fleet' },
    }),

  fleetCommissionUpdate: (hostUserId: string) =>
    sendPushNotification({
      userId: hostUserId,
      title: 'Commission Updated',
      body: 'Your commission rate has been updated by your fleet manager',
      type: 'fleet_commission_update',
      data: { screen: 'revenue' },
    }),

  // ─── Fleet → Both ──────────────────────────────────────────────

  fleetBookingApproved: (hostUserId: string, guestUserId: string, carName: string, bookingId: string) => {
    sendPushNotification({ userId: hostUserId, title: 'Fleet Approved Booking', body: `Your fleet manager approved the booking for ${carName}`, type: 'fleet_booking_approved', data: { bookingId, screen: 'booking-detail' } })
    sendPushNotification({ userId: guestUserId, title: 'Booking Confirmed!', body: `Your ${carName} rental is confirmed. Get ready for your trip!`, type: 'fleet_booking_approved', data: { bookingId, screen: 'booking-detail' } })
  },

  fleetBookingDeclined: (hostUserId: string, guestUserId: string, carName: string, bookingId: string) => {
    sendPushNotification({ userId: hostUserId, title: 'Fleet Declined Booking', body: `Your fleet manager declined the booking for ${carName}`, type: 'fleet_booking_declined', data: { bookingId, screen: 'booking-detail' } })
    sendPushNotification({ userId: guestUserId, title: 'Booking Declined', body: `The ${carName} rental was declined by the fleet manager`, type: 'fleet_booking_declined', data: { bookingId, screen: 'booking-detail' } })
  },
}
