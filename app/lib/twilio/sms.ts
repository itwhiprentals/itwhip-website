// app/lib/twilio/sms.ts
// Core SMS sending service with SmsLog tracking and duplicate protection

import { prisma } from '@/app/lib/database/prisma'
import { twilioClient, TWILIO_TOLLFREE_NUMBER, TWILIO_MESSAGING_SERVICE_SID, WEBHOOK_BASE_URL } from './client'
import { normalizePhone } from './phone'

// ─── Types ─────────────────────────────────────────────────────────

export type SmsType =
  | 'BOOKING_RECEIVED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_AUTO_COMPLETED'
  | 'BOOKING_ON_HOLD'
  | 'BOOKING_HOLD_RELEASED'
  | 'TRIP_STARTED'
  | 'TRIP_ENDED'
  | 'GUEST_APPROACHING'
  | 'BOOKING_CANCELLED'
  | 'DEPOSIT_RELEASED'
  | 'PICKUP_REMINDER'
  | 'RETURN_REMINDER'
  | 'CLAIM_FILED'
  | 'MISSED_MESSAGE'
  | 'EMERGENCY'
  | 'INBOUND'
  | 'IVR_SMS'
  | 'SYSTEM'

interface SendSmsOptions {
  type: SmsType
  bookingId?: string
  hostId?: string
  guestId?: string
  locale?: string
}

interface SendSmsResult {
  success: boolean
  sid?: string
  logId?: string
  error?: string
}

// ─── Duplicate Protection ──────────────────────────────────────────

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

async function isDuplicate(to: string, type: string, bookingId?: string): Promise<boolean> {
  if (!bookingId) return false

  const recent = await prisma.smsLog.findFirst({
    where: {
      to,
      type,
      bookingId,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      status: { notIn: ['failed', 'undelivered'] },
    },
    select: { id: true },
  })

  return !!recent
}

// ─── Core Send Function ────────────────────────────────────────────

export async function sendSms(
  to: string,
  body: string,
  opts: SendSmsOptions
): Promise<SendSmsResult> {
  // Normalize phone
  const normalizedTo = normalizePhone(to)
  if (!normalizedTo) {
    console.warn(`[SMS] Invalid phone number, skipping: ${to}`)
    return { success: false, error: 'Invalid phone number' }
  }

  // Check for duplicates
  if (await isDuplicate(normalizedTo, opts.type, opts.bookingId)) {
    console.log(`[SMS] Duplicate detected, skipping: ${opts.type} to ${normalizedTo} for booking ${opts.bookingId}`)
    return { success: false, error: 'Duplicate message' }
  }

  // Create log record first (status: queued)
  const logRecord = await prisma.smsLog.create({
    data: {
      to: normalizedTo,
      from: TWILIO_TOLLFREE_NUMBER,
      body,
      type: opts.type,
      status: 'queued',
      bookingId: opts.bookingId || null,
      hostId: opts.hostId || null,
      guestId: opts.guestId || null,
      locale: opts.locale || 'en',
    },
  })

  // Check if Twilio client is available
  if (!twilioClient) {
    console.error('[SMS] Twilio client not initialized — missing credentials')
    await prisma.smsLog.update({
      where: { id: logRecord.id },
      data: { status: 'failed', errorMessage: 'Twilio client not initialized' },
    })
    return { success: false, logId: logRecord.id, error: 'Twilio not configured' }
  }

  try {
    // Use Messaging Service when available (handles 10DLC compliance)
    // Falls back to sending from phone number directly
    // NOTE: Temporarily bypassing Messaging Service due to invalid SID - use phone number directly
    const message = await twilioClient.messages.create({
      body,
      to: normalizedTo,
      from: TWILIO_TOLLFREE_NUMBER,
      statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/sms-status`,
    })

    // Update log with Twilio SID and status
    await prisma.smsLog.update({
      where: { id: logRecord.id },
      data: {
        twilioSid: message.sid,
        status: message.status,
        segments: message.numSegments ? parseInt(String(message.numSegments)) : 1,
      },
    })

    console.log(`[SMS] Sent ${opts.type} to ${normalizedTo}: ${message.sid}`)
    return { success: true, sid: message.sid, logId: logRecord.id }
  } catch (error: unknown) {
    const twilioError = error as { code?: number; message?: string; status?: number }

    // Error 21610 = STOP received (user opted out at carrier level)
    if (twilioError.code === 21610) {
      console.log(`[SMS] User opted out (STOP): ${normalizedTo}`)
      await handleOptOut(normalizedTo, opts.guestId)
    }

    await prisma.smsLog.update({
      where: { id: logRecord.id },
      data: {
        status: 'failed',
        errorCode: String(twilioError.code || ''),
        errorMessage: twilioError.message || 'Unknown error',
      },
    })

    console.error(`[SMS] Failed ${opts.type} to ${normalizedTo}:`, twilioError.message)
    return { success: false, logId: logRecord.id, error: twilioError.message }
  }
}

// ─── Opt-Out Handling ──────────────────────────────────────────────

async function handleOptOut(phone: string, guestId?: string) {
  // Update ReviewerProfile.smsNotifications = false if we can find the profile
  try {
    if (guestId) {
      await prisma.reviewerProfile.update({
        where: { id: guestId },
        data: { smsNotifications: false },
      })
      console.log(`[SMS] Disabled smsNotifications for guest ${guestId}`)
      return
    }

    // Try to find by phone number
    const digits = phone.replace(/\D/g, '').slice(-10)
    const profile = await prisma.reviewerProfile.findFirst({
      where: { phoneNumber: { contains: digits } },
      select: { id: true },
    })

    if (profile) {
      await prisma.reviewerProfile.update({
        where: { id: profile.id },
        data: { smsNotifications: false },
      })
      console.log(`[SMS] Disabled smsNotifications for profile ${profile.id}`)
    }
  } catch (err) {
    console.error('[SMS] Failed to handle opt-out:', err)
  }
}

// ─── Guest SMS Preference Check ────────────────────────────────────

export async function canSendToGuest(guestId: string | null | undefined): Promise<boolean> {
  if (!guestId) return true // If no profile, default to allowing (preference unknown)

  try {
    const profile = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: { smsNotifications: true },
    })
    return profile?.smsNotifications !== false
  } catch {
    return true // On error, default to allowing
  }
}

// ─── Guest Locale Lookup ───────────────────────────────────────────

export async function getGuestLocale(guestId: string | null | undefined): Promise<'en' | 'es' | 'fr'> {
  if (!guestId) return 'en'

  try {
    const profile = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: { preferredLanguage: true },
    })
    const lang = profile?.preferredLanguage
    if (lang === 'es' || lang === 'fr') return lang
    return 'en'
  } catch {
    return 'en'
  }
}
